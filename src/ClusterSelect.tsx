import React from 'react'
import { ENDPOINTS, useConnectionConfig } from './providers/connection';

interface DOMEvent {
    'target': {
      'value' : string
    }
  }


export default function ClusterSelect(props: any) {
    function handleSelCluster(event: DOMEvent) {
        if (!event) { return; }
        const new_url = event?.target?.value;
        console.log(`new url %s`, new_url);
        setEndpoint(new_url);
        if (props.handler) {
            props.handler(new_url);
        }
      }

    const {endpoint, setEndpoint} = useConnectionConfig();
    let clusterOpts = ENDPOINTS.length > 0
    && ENDPOINTS.map((item, i) => {
    return (
        <option key={item.name} value={item.endpoint}>{item.name}</option>
    )});

    
    return (
        <div>
            <select onChange={handleSelCluster}>
                {clusterOpts}
            </select>
        </div>
    )
}
