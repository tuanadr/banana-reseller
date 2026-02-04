import axios from 'axios';

// --- Types based on Gommo AI Docs ---

export interface GommoModel {
    id_base: string;
    name: string;
    server: string;
    model: string;
    price: number;
    type?: string; // image, video, tts
}

export interface CreateImageRequest {
    model: string;
    prompt: string;
    negative_prompt?: string;
    width?: number;
    height?: number;
    ratio?: string; // 16:9, 9:16, 1:1
    // Add other params if needed
}

export interface ImageInfo {
    id_base: string;
    status: 'PENDING_ACTIVE' | 'PENDING_PROCESSING' | 'SUCCESS' | 'ERROR';
    url: string | null;
    prompt: string;
}

export interface GommoResponse<T> {
    data?: T;
    imageInfo?: T; // Create/Check Image often returns this key
    success?: boolean;
    message?: string;
    error?: number | string;
}

// --- API Client ---

const BASE_URL = 'https://api.gommo.net';

export class GommoClient {
    private apiKey: string;
    private domain: string;
    private proxyUrl?: string;
    private userAgent?: string;

    constructor(apiKey: string, domain: string = 'api.gommo.net', config?: { proxyUrl?: string; userAgent?: string }) {
        this.apiKey = apiKey;
        this.domain = domain;
        this.proxyUrl = config?.proxyUrl;
        this.userAgent = config?.userAgent;
    }

    private getHeaders() {
        return {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': this.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };
    }

    private async request(endpoint: string, params: Record<string, any>) {
        const data = new URLSearchParams();
        data.append('access_token', this.apiKey);
        data.append('domain', this.domain); // Gommo requires domain param? Docs say "domain: {{domain}}"

        // Append other params
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value) || typeof value === 'object') {
                    data.append(key, JSON.stringify(value));
                } else {
                    data.append(key, String(value));
                }
            }
        }

        try {
            const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
                headers: this.getHeaders(),
                proxy: this.proxyUrl ? this.parseProxy(this.proxyUrl) : false,
            });

            if (response.data.error && response.data.error !== 0) {
                throw new Error(response.data.message || 'Gommo API Error');
            }

            return response.data;
        } catch (error: any) {
            // Handle Axios errors
            if (error.response) {
                throw new Error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    private parseProxy(proxyUrl: string) {
        try {
            const url = new URL(proxyUrl);
            return {
                protocol: url.protocol.replace(':', ''),
                host: url.hostname,
                port: parseInt(url.port),
                auth: (url.username && url.password) ? {
                    username: url.username,
                    password: url.password
                } : undefined
            };
        } catch (e) {
            console.error("Invalid Proxy URL", proxyUrl);
            return false;
        }
    }

    // --- Endpoints ---

    async listModels(type: 'image' | 'video' | 'tts' = 'image') {
        const res = await this.request('/ai/models', { type });
        return res.data as GommoModel[];
    }

    async createImage(params: CreateImageRequest) {
        const res = await this.request('/ai/generateImage', {
            action_type: 'create',
            model: params.model,
            prompt: params.prompt,
            // map other params if supported
            ratio: params.ratio
        });
        return res.imageInfo as ImageInfo;
    }

    async checkImageStatus(id_base: string) {
        const res = await this.request('/ai/image', { id_base });
        // The doc says success returns { id_base, status, url ... } directly, not wrapped in imageInfo?
        // Wait, Check Image Status response structure:
        /*
        {
          "id_base": "63727fbc5d082dea",
          ...
          "url": "...",
          "status": "SUCCESS"
        }
        */
        // It's a flat object.
        return res as ImageInfo;
    }

    async getAccountInfo() {
        const res = await this.request('/api/apps/go-mmo/ai/me', {});
        return res;
    }
}
