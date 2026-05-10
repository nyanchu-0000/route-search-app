import { useState } from "react";
import {
    GoogleMap,
    useJsApiLoader,
    DirectionsService,
    DirectionsRenderer,
} from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100vh" };
const center = { lat: 35.6812, lng: 139.7671 }; // 東京駅

function App() {
    // 1. フックは必ず最初に宣言
    const [directions, setDirections] =
        useState<google.maps.DirectionsResult | null>(null);
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [searchQuery, setSearchQuery] = useState<{
        o: string;
        d: string;
    } | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    });

    // 2. 読み込みエラーや読み込み中の処理
    if (loadError)
        return <div className="p-10">地図の読み込みに失敗しました</div>;
    if (!isLoaded) return <div className="p-10 font-sans">読み込み中...</div>;

    // 3. 検索実行
    const handleSearch = () => {
        if (origin && destination) {
            setDirections(null);
            setSearchQuery({ o: origin, d: destination });
        }
    };

    return (
        <div className="relative w-full h-screen font-sans text-gray-900">
            {/* 入力パネル */}
            <div className="absolute top-4 left-4 z-10 w-80 p-5 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-100">
                <h1 className="text-xl font-black mb-4 tracking-tighter">
                    ROUTE SEARCH
                </h1>
                <div className="space-y-3">
                    <input
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                        placeholder="出発地"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                    />
                    <input
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none"
                        placeholder="目的地"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                    <button
                        onClick={handleSearch}
                        className="w-full py-3 bg-black text-white rounded-xl font-bold hover:opacity-80 transition-all"
                    >
                        ルートを表示
                    </button>
                </div>
            </div>

            {/* 地図エリア */}
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
            >
                {searchQuery && (
                    <DirectionsService
                        options={{
                            origin: searchQuery.o,
                            destination: searchQuery.d,
                            travelMode: google.maps.TravelMode.DRIVING,
                        }}
                        callback={(res) => {
                            if (res !== null && res.status === "OK")
                                setDirections(res);
                        }}
                    />
                )}
                {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
        </div>
    );
}

export default App;
