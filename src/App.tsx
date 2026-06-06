import { useState } from "react";
import {
    GoogleMap,
    useJsApiLoader,
    DirectionsService,
    DirectionsRenderer,
    Marker,
} from "@react-google-maps/api";

const center = { lat: 35.6812, lng: 139.7671 };

function App() {
    const [directions, setDirections] =
        useState<google.maps.DirectionsResult | null>(null);
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [searchQuery, setSearchQuery] = useState<{
        o: string;
        d: string;
    } | null>(null);

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [places, setPlaces] = useState<google.maps.places.PlaceResult[]>([]);
    const [radius, setRadius] = useState<number>(500);

    const { isLoaded, loadError } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places", "geometry"],
    });

    if (loadError)
        return <div className="p-10">地図の読み込みに失敗しました</div>;
    if (!isLoaded) return <div className="p-10 font-sans">読み込み中...</div>;

    const handleSearch = () => {
        if (origin && destination) {
            setDirections(null);
            setPlaces([]);
            setSearchQuery({ o: origin, d: destination });
        }
    };

    const searchPlaces = (keyword: string) => {
        if (!map || !directions) return;

        const service = new google.maps.places.PlacesService(map);
        const routeBounds = directions.routes[0].bounds;
        const path = directions.routes[0].overview_path;

        service.textSearch(
            {
                query: keyword,
                bounds: routeBounds,
            },
            (results, status) => {
                if (
                    status === google.maps.places.PlacesServiceStatus.OK &&
                    results
                ) {
                    // ルートから近いものだけを残すフィルタリング
                    const filteredPlaces = results.filter((place) => {
                        if (!place.geometry?.location) return false;

                        const distances = path.map((point) =>
                            google.maps.geometry.spherical.computeDistanceBetween(
                                place.geometry!.location!,
                                point,
                            ),
                        );

                        const minDistance = Math.min(...distances);
                        return minDistance <= radius;
                    });

                    setPlaces(filteredPlaces);

                    if (filteredPlaces.length === 0) {
                        alert(
                            `ルート周辺（${radius}m以内）に${keyword}は見つかりませんでした。`,
                        );
                    }
                } else {
                    alert(`${keyword}は見つかりませんでした。`);
                }
            },
        );
    };

    return (
        <div className="flex w-full h-screen font-sans text-gray-900 bg-white overflow-hidden">
            {/* 入力パネル */}
            <div className="w-80 md:w-96 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.08)] z-10 flex flex-col border-r border-gray-100">
                <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                    <h1 className="text-2xl font-black mb-8 tracking-tighter text-black">
                        ROUTE SEARCH
                    </h1>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 pl-1">
                                出発地
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                                placeholder="例: 東京駅"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 pl-1">
                                目的地
                            </label>
                            <input
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm"
                                placeholder="例: 新宿駅"
                                value={destination}
                                onChange={(e) => setDestination(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="w-full py-3.5 mt-2 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md"
                        >
                            ルートを表示
                        </button>
                    </div>
                    {directions && (
                        <div className="mt-10 pt-8 border-t border-gray-100">
                            <h2 className="text-sm font-black mb-5 text-gray-800">
                                周辺施設を探す
                            </h2>
                            <div className="mb-6 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">
                                    検索範囲
                                </span>
                                <div className="flex gap-1.5">
                                    {[300, 500, 1000].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setRadius(r)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                radius === r
                                                    ? "bg-black text-white shadow-sm"
                                                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                                            }`}
                                        >
                                            {r}m
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {["コンビニ", "カフェ", "駐車場"].map(
                                    (keyword) => (
                                        <button
                                            key={keyword}
                                            onClick={() =>
                                                searchPlaces(keyword)
                                            }
                                            className="py-2.5 bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-xl hover:border-black hover:text-black transition-all"
                                        >
                                            {keyword}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 地図エリア */}
            <div className="flex-1 relative">
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={center}
                    zoom={13}
                    onLoad={(mapInstance) => setMap(mapInstance)}
                    options={{
                        disableDefaultUI: true,
                        zoomControl: true,
                    }}
                >
                    {places.map((place, index) => (
                        <Marker
                            key={index}
                            position={place.geometry?.location}
                            title={place.name}
                        />
                    ))}
                    {searchQuery && (
                        <DirectionsService
                            options={{
                                origin: searchQuery.o,
                                destination: searchQuery.d,
                                travelMode: google.maps.TravelMode.DRIVING,
                            }}
                            callback={(res, status) => {
                                if (res !== null && status === "OK")
                                    setDirections(res);
                            }}
                        />
                    )}
                    {directions && (
                        <DirectionsRenderer directions={directions} />
                    )}
                </GoogleMap>
            </div>
        </div>
    );
}
export default App;
