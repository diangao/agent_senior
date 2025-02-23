// src/lib/service-monitor.ts

interface ServiceStatus {
    isAvailable: boolean;
    lastChecked: Date;
    errorCount: number;
    averageResponseTime: number;
  }
  
  export class ServiceMonitor {
    private serviceStatuses: Map<string, ServiceStatus> = new Map();
    private retryLimit = 3;
    private checkInterval = 60000; // 1 minute
  
    constructor() {
      this.initializeServices();
      this.startMonitoring();
    }
  
    private initializeServices() {
      const services = [
        'emergency',
        'notification',
        'health',
        'transportation'
      ];
  
      services.forEach(service => {
        this.serviceStatuses.set(service, {
          isAvailable: true,
          lastChecked: new Date(),
          errorCount: 0,
          averageResponseTime: 0
        });
      });
    }
  
    private startMonitoring() {
      setInterval(() => {
        this.checkAllServices();
      }, this.checkInterval);
    }
  
    private async checkAllServices() {
      for (const [service, status] of this.serviceStatuses) {
        try {
          const startTime = Date.now();
          await this.checkService(service);
          const endTime = Date.now();
          
          this.updateServiceStatus(service, {
            isAvailable: true,
            lastChecked: new Date(),
            errorCount: 0,
            averageResponseTime: ((status.averageResponseTime * 9) + (endTime - startTime)) / 10
          });
        } catch (error) {
          this.handleServiceError(service);
        }
      }
    }
  
    private async checkService(service: string) {
      const serviceUrl = process.env[`NEXT_PUBLIC_${service.toUpperCase()}_SERVICE_URL`];
      if (!serviceUrl) return;
  
      try {
        const response = await fetch(`${serviceUrl}/health`);
        if (!response.ok) {
          throw new Error(`Service ${service} health check failed`);
        }
      } catch (error) {
        throw new Error(`Service ${service} is unavailable`);
      }
    }
  
    private handleServiceError(service: string) {
      const status = this.serviceStatuses.get(service);
      if (status) {
        this.updateServiceStatus(service, {
          ...status,
          isAvailable: false,
          lastChecked: new Date(),
          errorCount: status.errorCount + 1
        });
  
        if (status.errorCount >= this.retryLimit) {
          this.notifyAdministrator(service);
        }
      }
    }
  
    private updateServiceStatus(service: string, status: ServiceStatus) {
      this.serviceStatuses.set(service, status);
      this.notifyStatusChange(service, status);
    }
  
    private notifyAdministrator(service: string) {
      // 实现管理员通知逻辑
      console.error(`Service ${service} is experiencing issues. Please check.`);
    }
  
    private notifyStatusChange(service: string, status: ServiceStatus) {
      // 发布服务状态变化事件
      const event = new CustomEvent('serviceStatusChange', {
        detail: { service, status }
      });
      window.dispatchEvent(event);
    }
  
    // 公共方法
    public getServiceStatus(service: string): ServiceStatus | undefined {
      return this.serviceStatuses.get(service);
    }
  
    public async executeWithRetry<T>(
      service: string,
      action: () => Promise<T>,
      retries = this.retryLimit
    ): Promise<T> {
      try {
        return await action();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return this.executeWithRetry(service, action, retries - 1);
        }
        throw error;
      }
    }
  
    public isServiceAvailable(service: string): boolean {
      return this.serviceStatuses.get(service)?.isAvailable ?? false;
    }
  }