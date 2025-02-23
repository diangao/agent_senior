// src/lib/health-monitor.ts

interface HealthReading {
    type: 'blood_pressure' | 'heart_rate' | 'glucose' | 'temperature';
    value: number | string;
    timestamp: Date;
    unit: string;
  }
  
  interface HealthAlert {
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    timestamp: Date;
    recommendation?: string;
  }
  
  export class HealthMonitor {
    private readings: HealthReading[] = [];
    private alerts: HealthAlert[] = [];
    private thresholds = {
      blood_pressure: {
        systolic: { low: 90, high: 140 },
        diastolic: { low: 60, high: 90 }
      },
      heart_rate: { low: 60, high: 100 },
      glucose: { low: 70, high: 180 },
      temperature: { low: 36.5, high: 37.5 }
    };
  
    public addReading(reading: HealthReading) {
      this.readings.push(reading);
      this.analyzeReading(reading);
    }
  
    private analyzeReading(reading: HealthReading) {
      switch (reading.type) {
        case 'blood_pressure':
          this.analyzeBloodPressure(reading);
          break;
        case 'heart_rate':
          this.analyzeHeartRate(reading);
          break;
        case 'glucose':
          this.analyzeGlucose(reading);
          break;
        // Add more health metrics as needed
      }
    }
  
    private analyzeBloodPressure(reading: HealthReading) {
      const [systolic, diastolic] = (reading.value as string).split('/').map(Number);
      
      if (systolic > this.thresholds.blood_pressure.systolic.high) {
        this.createAlert({
          type: 'high_blood_pressure',
          severity: 'high',
          message: 'High blood pressure detected',
          timestamp: new Date(),
          recommendation: 'Please take your blood pressure medication and rest'
        });
      }
    }
  
    private analyzeHeartRate(reading: HealthReading) {
      const value = reading.value as number;
      
      if (value > this.thresholds.heart_rate.high) {
        this.createAlert({
          type: 'high_heart_rate',
          severity: 'medium',
          message: 'Elevated heart rate detected',
          timestamp: new Date(),
          recommendation: 'Please sit down and rest for a few minutes'
        });
      }
    }
  
    private analyzeGlucose(reading: HealthReading) {
      const value = reading.value as number;
      
      if (value < this.thresholds.glucose.low) {
        this.createAlert({
          type: 'low_glucose',
          severity: 'high',
          message: 'Low blood sugar detected',
          timestamp: new Date(),
          recommendation: 'Please eat something sweet immediately'
        });
      }
    }
  
    private createAlert(alert: HealthAlert) {
      this.alerts.push(alert);
      this.notifyCaregiver(alert);
    }
  
    private notifyCaregiver(alert: HealthAlert) {
      if (alert.severity === 'high') {
        // 实现紧急联系人通知逻辑
        console.log('Notifying caregiver:', alert);
      }
    }
  
    public getLatestReadings(): HealthReading[] {
      return this.readings.slice(-5);
    }
  
    public getActiveAlerts(): HealthAlert[] {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60000);
      return this.alerts.filter(alert => alert.timestamp > fiveMinutesAgo);
    }
  
    public getHealthSummary(): string {
      const latestReadings = this.getLatestReadings();
      const activeAlerts = this.getActiveAlerts();
      
      let summary = 'Health Status Summary:\n';
      
      if (latestReadings.length > 0) {
        summary += '\nLatest Readings:\n';
        latestReadings.forEach(reading => {
          summary += `${reading.type}: ${reading.value} ${reading.unit}\n`;
        });
      }
      
      if (activeAlerts.length > 0) {
        summary += '\nActive Alerts:\n';
        activeAlerts.forEach(alert => {
          summary += `${alert.severity.toUpperCase()}: ${alert.message}\n`;
          if (alert.recommendation) {
            summary += `Recommendation: ${alert.recommendation}\n`;
          }
        });
      }
      
      return summary;
    }
  }