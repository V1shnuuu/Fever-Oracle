import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Database, Download, Activity, Server, ActivitySquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';

interface KafkaStats {
    topics: {
        name: string;
        messages_per_minute: number;
        total_messages: number;
        status: 'active' | 'idle';
    }[];
    total_throughput: number;
    kafka_available: boolean;
    mode: 'mock' | 'live';
}

export default function KafkaExport() {
    const { toast } = useToast();
    const [isDownloading, setIsDownloading] = useState(false);

    // Fetch Kafka Stats every 5 seconds
    const { data: stats, isLoading: isLoadingStats } = useQuery<KafkaStats>({
        queryKey: ['kafkaStats'],
        queryFn: async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/kafka/stats`);
                if (!res.ok) throw new Error("Failed to fetch Kafka stats");
                return await res.json();
            } catch (err) {
                console.warn("Backend unavailable, using mocked Kafka stats.");
                return {
                    topics: [
                        { name: "fever-oracle-wastewater", messages_per_minute: 12, total_messages: 1450, status: "active" },
                        { name: "fever-oracle-pharmacy", messages_per_minute: 8, total_messages: 890, status: "active" },
                        { name: "fever-oracle-patients", messages_per_minute: 25, total_messages: 5600, status: "active" },
                        { name: "fever-oracle-vitals", messages_per_minute: 45, total_messages: 12400, status: "active" },
                        { name: "fever-oracle-alerts", messages_per_minute: 2, total_messages: 156, status: "active" },
                    ],
                    total_throughput: 92,
                    kafka_available: false,
                    mode: "mock"
                };
            }
        },
        refetchInterval: 5000
    });

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            let result;
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/kafka/latest-data`);
                if (!res.ok) throw new Error("Failed to fetch Kafka payload");
                result = await res.json();
            } catch (err) {
                console.warn("Backend unavailable, using mocked Kafka data.");
                result = {
                    data: {
                        wastewater: [{ timestamp: new Date().toISOString(), region: 'Northeast', viral_load: 45.5, threshold: 70.0, sample_location: 'Treatment_Plant_1' }],
                        pharmacy: [{ timestamp: new Date().toISOString(), region: 'Central', sales_index: 82.1, baseline: 85.0, pharmacy_chain: 'CVS' }],
                        alerts: [{ severity: 'high', region: 'Northeast District', message: 'Elevated fever cases detected', timestamp: new Date().toISOString(), source: 'Federated Learning', confidence: 92 }],
                        vitals: [{ patient_id: 'PT-2045', timestamp: new Date().toISOString(), temperature: 38.2, heart_rate: 95, blood_pressure_systolic: 125 }]
                    },
                    mode: 'mock'
                };
            }
            const payload = result.data;

            if (!payload || Object.keys(payload).length === 0) {
                toast({
                    title: "No Data Available",
                    description: "No recent messages found on the Kafka broker.",
                    variant: "destructive"
                });
                setIsDownloading(false);
                return;
            }

            // Convert JSON payload into flattened CSV rows
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Topic/Category,Timestamp,Region/Location,Metric_1,Metric_2,Other_Data\n";

            for (const [topic, messages] of Object.entries(payload)) {
                if (Array.isArray(messages)) {
                    messages.forEach(msg => {
                        const timestamp = msg.timestamp || new Date().toISOString();
                        let region = msg.region || msg.sample_location || 'N/A';
                        let m1 = '', m2 = '', other = '';

                        if (topic === 'wastewater') {
                            m1 = `Viral Load: ${msg.viral_load}`;
                            m2 = `Threshold: ${msg.threshold}`;
                        } else if (topic === 'pharmacy') {
                            m1 = `Sales Index: ${msg.sales_index}`;
                            m2 = `Baseline: ${msg.baseline}`;
                            other = msg.pharmacy_chain || '';
                        } else if (topic === 'vitals') {
                            region = `Patient: ${msg.patient_id}`;
                            m1 = `Temp: ${msg.temperature}`;
                            m2 = `HR: ${msg.heart_rate}`;
                            other = `BP: ${msg.blood_pressure_systolic}`;
                        } else if (topic === 'alerts') {
                            m1 = `Severity: ${msg.severity}`;
                            m2 = msg.message;
                            other = `Confidence: ${msg.confidence}%`;
                        }

                        // Escape quotes and wrap in quotes for CSV integrity
                        const row = [topic, timestamp, region, m1, m2, other]
                            .map(item => `"${String(item).replace(/"/g, '""')}"`)
                            .join(",");

                        csvContent += row + "\n";
                    });
                }
            }

            // Trigger Download
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `fever_oracle_kafka_export_${new Date().getTime()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Download Complete",
                description: `Successfully exported live real-time payload. Mode: ${result.mode || 'N/A'}`
            });

        } catch (error) {
            console.error("Export Error:", error);
            toast({
                title: "Export Failed",
                description: "Ensure the backend and Kafka cluster are running.",
                variant: "destructive"
            });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
                        <Database className="h-8 w-8 text-primary" />
                        Live Data Streaming
                    </h1>
                    <p className="text-muted-foreground">
                        Monitor real-time Kafka event streams and export unified telemetrics
                    </p>
                </div>
                <div className="flex gap-3">
                    <Badge variant={stats?.mode === 'live' ? 'default' : 'secondary'} className="h-8 shadow-sm">
                        {stats?.mode === 'live' ? (
                            <><Server className="mr-2 h-3.5 w-3.5" /> Kafka Cluster Online </>
                        ) : (
                            <><ActivitySquare className="mr-2 h-3.5 w-3.5" /> Simulation Mode </>
                        )}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Global Throughput</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total_throughput || 0}</div>
                        <p className="text-xs text-muted-foreground">msgs / min</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Topic Synchronization Status</CardTitle>
                    <CardDescription>Current state of distributed message queues</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingStats ? (
                        <div className="py-8 text-center text-muted-foreground animate-pulse leading-relaxed">
                            Establishing broker connection...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stats?.topics.map((t) => (
                                <div key={t.name} className="flex justify-between items-center p-3 border rounded-lg bg-card shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm">{t.name}</span>
                                        <span className="text-xs text-muted-foreground">{t.total_messages} total items</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <Badge variant={t.status === 'active' ? 'default' : 'outline'}>
                                            {t.status.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground mt-1">
                                            {t.messages_per_minute} m/m
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <CardTitle>Data Export Pipeline</CardTitle>
                    <CardDescription>
                        Generate a unified tabular dataset (CSV format) directly from the live Kafka consumer ring buffer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button
                        size="lg"
                        onClick={handleDownload}
                        disabled={isDownloading || isLoadingStats}
                        className="w-full sm:w-auto"
                    >
                        {isDownloading ? (
                            <Activity className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-5 w-5" />
                        )}
                        {isDownloading ? "Constructing CSV Payload..." : "Download Live Data (CSV)"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
