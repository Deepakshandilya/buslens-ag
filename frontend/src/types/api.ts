// TypeScript interfaces mirroring backend Pydantic schemas

// ── Stops ──
export interface StopOut {
    id: number;
    name: string;
}

export interface StopsResponse {
    query: string;
    results: StopOut[];
}

// ── Routes ──
export interface RouteSearchRequest {
    from_stop: string;
    to_stop: string;
}

export interface RouteSearchResult {
    route_number: string;
    direction: string;
    from_sequence: number;
    to_sequence: number;
    stops_between: string[] | null;
}

export interface RouteStop {
    sequence_no: number;
    name: string;
}

export interface RouteDetailResponse {
    route_number: string;
    direction: string;
    stops: RouteStop[];
}

// ── Stop Routes ──
export interface StopRouteItem {
    route_number: string;
    direction: string;
    sequence_no: number;
}

export interface StopRoutesResponse {
    stop_id: number;
    stop_name: string;
    routes: StopRouteItem[];
}

// ── Auth ──
export interface UserCreate {
    email: string;
    password: string;
}

export interface UserResponse {
    id: number;
    email: string;
    created_at: string;
}

export interface Token {
    access_token: string;
    token_type: string;
}

// ── Favorites ──
export interface FavoriteCreate {
    route_id?: number | null;
    stop_id?: number | null;
}

export interface FavoriteResponse {
    id: number;
    user_id: number;
    route_id: number | null;
    stop_id: number | null;
    created_at: string;
}

// ── History ──
export interface HistoryCreate {
    from_stop_id: number;
    to_stop_id: number;
}

export interface HistoryResponse {
    id: number;
    user_id: number;
    from_stop_id: number;
    to_stop_id: number;
    searched_at: string;
}
