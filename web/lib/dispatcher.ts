import prisma from './prisma';
import { GommoClient, CreateImageRequest } from './gommo';
// import { AccountType, TaskStatus } from '@prisma/client';

export class Dispatcher {

    /**
     * Main Entry point: User requests an image.
     * Creates a task record and attempts to process it immediately.
     */
    async submitTask(userId: string, request: CreateImageRequest) {
        // 1. Create Task in DB (PENDING)
        const task = await prisma.generationTask.create({
            data: {
                userId,
                prompt: request.prompt,
                width: request.width || 1024,
                height: request.height || 1024,
                modelSupported: request.model,
                status: 'PENDING' as any, // Bypass Enum export issue
                costToUser: 500, // Hardcoded or fetch from config
            }
        });

        // 2. Attempt to process immediately
        return this.attemptTask(task.id);
    }

    /**
     * Tries to find an available account and execute the task.
     */
    async attemptTask(taskId: string) {
        const task = await prisma.generationTask.findUnique({
            where: { id: taskId },
            include: { user: true }
        });

        if (!task || task.status !== 'PENDING') return task;

        // 3. Find Best Account
        const account = await this.getBestAccount(task.user.isVip);

        if (!account) {
            // No account available (Queue full or all busy)
            return task;
        }

        // 4. Execute on Gommo
        const client = new GommoClient(account.apiKey, 'api.gommo.net', {
            userAgent: account.userAgent || undefined,
            proxyUrl: account.proxyUrl || undefined
        });

        try {
            const result = await client.createImage({
                model: task.modelSupported || 'banana-default',
                prompt: task.prompt,
                width: task.width,
                height: task.height,
                // ... map other params
            });

            // 5. Update Task
            const updatedTask = await prisma.generationTask.update({
                where: { id: taskId },
                data: {
                    status: 'PROCESSING',
                    providerAccountId: account.id,
                    providerTaskId: result.id_base, // Store the Gommo ID
                    costIncurred: (account.type as string) === 'PAY_AS_YOU_GO' ? 100 : 0,
                    resultUrl: null, // Not ready yet
                    startedAt: new Date(),
                }
            });

            // Update Account Usage
            await prisma.providerAccount.update({
                where: { id: account.id },
                data: { totalUsage: { increment: 1 } }
            });

            return updatedTask;

        } catch (error: any) {
            console.error("Gommo API Error", error);
            await prisma.providerAccount.update({
                where: { id: account.id },
                data: { errorCount: { increment: 1 } }
            });

            return task;
        }
    }

    /**
     * Core Logic: Smart Account Selection
     */
    private async getBestAccount(isVip: boolean) {
        const accounts = await prisma.providerAccount.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { priority: 'asc' }
        });

        if (accounts.length === 0) return null;

        for (const account of accounts) {
            if ((account.type as string) === 'UNLIMITED') {
                const activeCount = await prisma.generationTask.count({
                    where: {
                        providerAccountId: account.id,
                        status: { in: ['PROCESSING' as any] }
                    }
                });

                if (activeCount < account.concurrencyLimit) {
                    return account;
                }
            } else if ((account.type as string) === 'PAY_AS_YOU_GO') {
                // Fallback or VIP usage
                return account;
            }
        }

        return null;
    }

    /**
     * Called by Frontend polling to check status and Update DB.
     */
    async checkTaskStatus(taskId: string) {
        const task = await prisma.generationTask.findUnique({
            where: { id: taskId },
            include: { providerAccount: true }
        });

        if (!task) return null;

        if (task.status === 'PENDING') {
            // Try to attempt again! (Virtual Queue processing)
            return this.attemptTask(taskId);
        }

        if (task.status === 'PROCESSING' && task.providerAccount && task.providerTaskId) {
            const client = new GommoClient(task.providerAccount.apiKey, 'api.gommo.net');

            try {
                const statusInfo = await client.checkImageStatus(task.providerTaskId);

                if (statusInfo.status === 'SUCCESS' && statusInfo.url) {
                    // Task Completed
                    const completedTask = await prisma.generationTask.update({
                        where: { id: taskId },
                        data: {
                            status: 'COMPLETED',
                            resultUrl: statusInfo.url,
                            completedAt: new Date()
                        }
                    });
                    return completedTask;
                } else if (statusInfo.status === 'ERROR') {
                    const failedTask = await prisma.generationTask.update({
                        where: { id: taskId },
                        data: {
                            status: 'FAILED',
                            errorMessage: 'Upstream Provider Error',
                            completedAt: new Date()
                        }
                    });
                    return failedTask;
                }
                // Else still processing
                return task;
            } catch (e) {
                console.error("Check status failed", e);
                return task;
            }
        }

        return task;
    }
}

export const dispatcher = new Dispatcher();
