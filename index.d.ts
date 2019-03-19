export enum SpotifyRegion {
  EU = "2311",
  US = "3079"
}
export enum SonosPlaymodes {
  NORMAL = "NORMAL",
  REPEAT_ONE = "REPEAT_ONE",
  REPEAT_ALL = "REPEAT_ALL",
  SHUFFLE = "SHUFFLE",
  SHUFFLE_NOREPEAT = "SHUFFLE_NOREPEAT",
  SHUFFLE_REPEAT_ONE = "SHUFFLE_REPEAT_ONE"
}
export enum searchTypes {
  "artists" = "A:ARTIST",
  "albumArtists" = "A:ALBUMARTIST",
  "albums" = "A:ALBUM",
  "genres" = "A:GENRE",
  "composers" = "A:COMPOSER",
  "tracks" = "A:TRACKS",
  "playlists" = "A:PLAYLISTS",
  "sonos_playlists" = "SQ",
  "share" = "S"
}
// https://github.com/bencevans/node-sonos/blob/master/lib/events/adv-listener.js#L189
export class DeviceSubscription {
  constructor(device: Sonos);
  public addSubscription(endpoint: string): Promise<string>; // sid type is string?
  public renewAllSubscriptions(): Promise<string>; // array of sids?
  public renewSubscription(sid: string): Promise<string>; // sid type is string?
  public hasSubscription(sid: string): boolean;
  public handleNotification(endpoint: string, body: object): Promise<void>;
  public cancelAllSubscriptions(): Promise<Array<void>>;
  public headerToDateTime(timeout: string): number;
}
// https://github.com/bencevans/node-sonos/blob/master/lib/events/adv-listener.js#L34
export namespace Listener {
	function startListener(): void;
	function stopListener(): Promise<void>;
	function isListening(): boolean;
	function subscribeTo(device: Sonos): Promise<boolean>;
	// TODO rest
}
export class Sonos {
  constructor(host: string, port?: number, options?: ISonosOptions);
  // group methods
  public getAllGroups(): Promise<ISonosGroup[]>;
  public leaveGroup(): Promise<boolean>;
  public joinGroup(otherDeviceName: string): Promise<boolean>;
  // library methods
  public getMusicLibrary(): Promise<ISonosItemResponse>;
  public searchMusicLibrary(
    searchType: searchTypes,
    searchTerm: string,
    requestOptions?: { start?: number; total: number },
    separator?: string
  ): Promise<ISonosItemResponse>;
  // playlist methods
  public getPlaylist(
    playlistId: string,
    requestOptions?: { start?: number; total: number }
  ): Promise<ISonosItemResponse>;
  public createPlaylist(
    title: string
  ): Promise<{
    NumTracksAdded: number;
    NewQueueLength: number;
    NewUpdateID: number;
    AssignedObjectID: string;
  }>;
  public deletePlaylist(playlistId: number): Promise<void>;
  public addToPlaylist(
    playlistId: number,
    uri: string
  ): Promise<{
    NumTracksAdded: number;
    NewQueueLength: number;
    NewUpdateID: number;
  }>;
  public removeFromPlaylist(
    playlistId: number,
    index: number
  ): Promise<{
    NumTracksAdded: number;
    NewQueueLength: number;
    NewUpdateID: number;
  }>;
  // events
  public on(event: string, callback: (data: any) => void): void;
  // volume
  public getVolume(): Promise<number>;
  public getMuted(): Promise<boolean>;
  // TuneIN
  public playTuneinRadio(
    stationId: string,
    stationTitle: string
  ): Promise<boolean>;
  // Spotify
  public setSpotifyRegion(region: SpotifyRegion): void;
  public playSpotifyRadio(
    artistId: string,
    artistName: string
  ): Promise<boolean>;
  // Radio
  public getFavoritesRadioStations(): Promise<ISonosItemResponse>;
  //LED
  public getLEDState(): Promise<string>;
  public setLEDState(newState: string): Promise<boolean>;
  // Zone
  public getZoneInfo(): Promise<object>;
  public getZoneAttrs(): Promise<object>;
  public setName(name: string): Promise<object>;
  public getName(): Promise<string>;
  // Device
  public deviceDescription(): Promise<object>;
  // base actions
  public play(options?: string | object): Promise<boolean>;
  public pause(): Promise<boolean>;
  public seek(seconds: number): Promise<boolean>;
  public stop(): Promise<boolean>;
  public next(): Promise<boolean>;
  public previous(): Promise<boolean>;
  // volume
  public setVolume(volume: number, channel?: string): Promise<object>;
  public setMuted(muted: boolean, channel?: string): Promise<object>;
  // play mode
  public getPlayMode(): Promise<SonosPlaymodes>;
  public setPlayMode(playmode: SonosPlaymodes): Promise<object>;
  // queue
  public queue(
    options: string | object,
    positionInQueue?: number
  ): Promise<boolean>;
  public flush(): Promise<object>;
  public selectQueue(): Promise<boolean>;
  public removeTracksFromQueue(
    startIndex: number,
    numberOfTracks?: number
  ): Promise<boolean>;
  public selectTrack(trackNr: number): Promise<boolean>;
  // generic actions
  public getFavorites(): Promise<ISonosItemResponse>;
  public getQueue(): Promise<ISonosItemResponse>;
  public currentTrack(): Promise<object>;
  public setAVTransportURI(uri: string | object): Promise<boolean>;
  public configureSleepTimer(sleepTimerDuration: string): Promise<object>;
  public getCurrentState(): Promise<string>;
  public togglePlayback(): Promise<boolean>;
  // TODO: rest https://github.com/bencevans/node-sonos/blob/master/lib/sonos.js#L752
}
declare class DiscoveryObject {
  public on(event: string, object: any): void;
  public destroy(callback: ()=>void):void;
}

export function DeviceDiscovery(
  options: object | Function,
  listener?: (device: any, model: any) => any
): DiscoveryObject;

interface ISonosGroupMember {
  UUID: string;
  Location: string;
}

interface ISonosGroup {
  Coordinator: string;
  ZoneGroupMember: ISonosGroupMember[];
}
interface ISonosOptionsEndpoints {
  transport: string;
  rendering: string;
  device: string;
}

interface ISonosOptionsSpotify {
  region: string;
}

interface ISonosOptions {
  endpoints?: ISonosOptionsEndpoints;
  spotify?: ISonosOptionsSpotify;
}

interface ISonosItemResponse {
  returned: string;
  total: string;
  items: { title: string; uri: string }[];
}
