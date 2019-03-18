export function CreateSoapEnvelop(body: string): string;
export function EncodeXml(input: string): string;
export function GetUpnpClass(parentID: string): string;
export function GenerateLocalMetadata(uri: string, artUri?: string): {uri: string, metadata: string}
export function GenerateMetadata(uri: string, title?: string, region?: string): {uri: string, metadata: string}
export function ParseDIDL(didl: string, host: string, port: number, trackUri: string): object;
export function ParseDIDLItem(item: string, host: string, port: number, trackUri: string): object;
export function TimeToSeconds(time: string): number;
export function TranslateState(state: string): string;
export function ParseXml(input: string): Promise<object>;
