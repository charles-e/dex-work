import { Connection} from '@safecoin/web3.js';

export interface EndpointInfo {
    name: string;
    endpoint: string;
    custom: boolean;
}

export interface ConnectionContextValues {
    endpoint: string;
    setEndpoint: (newEndpoint: string) => void;
    connection: Connection;
    sendConnection: Connection;
    availableEndpoints: EndpointInfo[];
    setCustomEndpoints: (newCustomEndpoints: EndpointInfo[]) => void;
  }
  