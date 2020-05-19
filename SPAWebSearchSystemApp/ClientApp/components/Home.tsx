import * as React from 'react';
import { RouteComponentProps } from 'react-router';

export class Home extends React.Component<RouteComponentProps<{}>, {}> {
    public render() {
        return <div>
            <p id="print_logo"><img style={{ margin: '10px' }} src="logo.png" width="111" height="55" alt="hplus sport" /></p>
            <h5>Admin Portal</h5>
        </div>;
    }
}
