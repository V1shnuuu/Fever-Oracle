import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, Thermometer, UserMinus, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Mock data for Indian cities with patient stats
const cityData = [
    { id: 1, name: 'Mumbai', lat: 19.0760, lng: 72.8777, atRisk: 1250, ill: 340, trend: 'up' },
    { id: 2, name: 'Delhi', lat: 28.7041, lng: 77.1025, atRisk: 1850, ill: 610, trend: 'up' },
    { id: 3, name: 'Bangalore', lat: 12.9716, lng: 77.5946, atRisk: 930, ill: 220, trend: 'stable' },
    { id: 4, name: 'Chennai', lat: 13.0827, lng: 80.2707, atRisk: 720, ill: 150, trend: 'down' },
    { id: 5, name: 'Kolkata', lat: 22.5726, lng: 88.3639, atRisk: 810, ill: 280, trend: 'up' },
    { id: 6, name: 'Hyderabad', lat: 17.3850, lng: 78.4867, atRisk: 680, ill: 190, trend: 'stable' },
    { id: 7, name: 'Pune', lat: 18.5204, lng: 73.8567, atRisk: 590, ill: 145, trend: 'down' },
    { id: 8, name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, atRisk: 410, ill: 110, trend: 'stable' },
    { id: 9, name: 'Surat', lat: 21.1702, lng: 72.8311, atRisk: 320, ill: 80, trend: 'down' },
    { id: 10, name: 'Jaipur', lat: 26.9124, lng: 75.7873, atRisk: 280, ill: 75, trend: 'stable' },
];

export default function LiveMap() {
    const navigate = useNavigate();
    const [totalRisk, setTotalRisk] = useState(0);
    const [totalIll, setTotalIll] = useState(0);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        setTotalRisk(cityData.reduce((acc, curr) => acc + curr.atRisk, 0));
        setTotalIll(cityData.reduce((acc, curr) => acc + curr.ill, 0));
    }, []);

    // Custom map pin icon using SVG
    const createCustomIcon = (illCount: number) => {
        let colorClass = 'text-red-500';
        if (illCount > 300) colorClass = 'text-red-900';
        else if (illCount > 150) colorClass = 'text-red-600';

        const html = `
            <div style="position: relative; font-size: 24px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 ${colorClass}" style="filter: drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))">
                <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
        `;

        return L.divIcon({
            html,
            className: 'bg-transparent border-0',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
    };

    useEffect(() => {
        if (!mapRef.current) return;

        // Clean up previous map instance if it exists (e.g., during React strict mode double render)
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        // Initialize Map centered on India
        const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // India coordinates
        mapInstance.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        cityData.forEach((city) => {
            const icon = createCustomIcon(city.ill);
            const marker = L.marker([city.lat, city.lng], { icon }).addTo(map);

            const popupContent = `
                <div class="p-1 min-w-[200px] font-sans">
                    <h3 class="font-bold text-lg mb-2 border-b pb-1">${city.name}</h3>
                    <div class="flex justify-between mb-1 text-sm">
                        <span class="text-gray-500">At Risk:</span>
                        <span class="font-semibold text-amber-600">${city.atRisk.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between mb-3 text-sm">
                        <span class="text-gray-500">Currently Ill:</span>
                        <span class="font-semibold text-red-600">${city.ill.toLocaleString()}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-2 pt-2 border-t text-xs">
                        <span class="text-gray-500">Trend:</span>
                        <span class="px-2 py-0.5 rounded text-[10px] font-medium border ${city.trend === 'up'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : city.trend === 'down'
                        ? 'bg-gray-100 text-gray-800 border-gray-200'
                        : 'bg-white text-gray-800 border-gray-200'
                }">
                            ${city.trend === 'up' ? 'Rising' : city.trend === 'down' ? 'Falling' : 'Stable'}
                        </span>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent);
        });

        // Use a timeout to ensure container is fully rendered before invalidating size
        setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Live Epidemiological Map</h1>
                    <p className="text-muted-foreground">
                        Real-time geospatial visualization of patient risk and confirmed cases
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Monitored Cities</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{cityData.length}</div>
                        <p className="text-xs text-muted-foreground">Active surveillance zones</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total At Risk</CardTitle>
                        <UserMinus className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-500">
                            {totalRisk.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Elevated probability score &gt; 0.75</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Currently Ill</CardTitle>
                        <Thermometer className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">
                            {totalIll.toLocaleString()}
                        </div>
                        <p className="text-xs text-muted-foreground">Confirmed active cases</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden border shadow-sm">
                <CardHeader>
                    <CardTitle>Geospatial Heat Map</CardTitle>
                    <CardDescription>Intensity reflects volume of confirmed cases</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div
                        ref={mapRef}
                        className="h-[600px] w-full z-10 relative bg-muted/20"
                        style={{ borderRadius: '0 0 0.5rem 0.5rem' }}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
