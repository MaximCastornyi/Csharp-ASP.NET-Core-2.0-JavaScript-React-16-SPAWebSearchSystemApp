import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import 'isomorphic-fetch';

interface Customer {
    customerId: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    email: string;
}

interface CustomersPaginated {
    customers: Customer[];
    totalPages: number;
}
class TheHelpers extends React.Component {
    static GetEmptyCustomer() {
        var c: Customer = { customerId: 0, name: '', address: '', city: '', state: '', country: '', email: '' };
        return c;
    }
}

interface CustomerState {
    customersPaginated: CustomersPaginated;
    currCustomer: Customer;
    currPage: number;
    errMsg: string;
    errCssClass: string;
}

export class CustomerList extends React.Component<any, CustomerState> {

    constructor(props: any) {
        super(props);
        this.state = { errMsg: '', errCssClass: 'errSuccess', currPage: 1, currCustomer: TheHelpers.GetEmptyCustomer(), customersPaginated: { customers: [], totalPages: 1 } };
        fetch('/api/data/getCustomers')
            .then(response => response.json() as Promise<CustomersPaginated>)
            .then(data => {
                this.setState({ customersPaginated: data });
            });
    }

    render() {
        var pageNums = [];
        for (var i: number = 1; i <= this.state.customersPaginated.totalPages; i++) {
            pageNums.push(i);
        }
        let cs = this.state.customersPaginated.customers;
        return (
            <div>
                <p id="print_logo"><img style={{ margin: '10px' }} src="logo.png" width="111" height="55" alt="hplus sport" /></p>
                <h5>Admin Portal</h5>

                <h2>Customer List</h2>
                <table className='listTab'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Address</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Country</th>
                            <th>Email</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cs.map((c) =>
                            <tr key={c.customerId}>
                                <td>{c.customerId}</td>
                                <td>{c.name}</td>
                                <td>{c.address}</td>
                                <td>{c.city}</td>
                                <td>{c.state}</td>
                                <td>{c.country}</td>
                                <td>{c.email}</td>
                                <td><a onClick={() => this.FillFormForUpdate(c)}>Edit</a></td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div>
                    <a onClick={() => this.ShowByPage('prev')}>prev</a>
                    <select
                        onChange={(e) => this.ShowByPage(e.target.value)}
                        value={this.state.currPage}>
                        {pageNums.map((i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                    <a onClick={() => this.ShowByPage('next')}>next</a>
                </div>

                <div>
                </div>
                <div className={this.state.errCssClass}>{this.state.errMsg}</div>

                <AddEditCustomer
                    customer={this.state.currCustomer}
                    actionAdd={this.AddUpdate.bind(this)}
                    actionReset={this.ResetForm.bind(this)}
                />
            </div>
        );
    }
    ShowByPage(nav: string) {
        var toPage: number = this.state.currPage;
        if (nav == 'prev')
            toPage = toPage - 1;
        else if (nav == 'next')
            toPage = toPage + 1;
        else
            toPage = parseInt(nav);

        if (toPage < 1) toPage = 1;
        if (toPage > this.state.customersPaginated.totalPages) toPage = this.state.customersPaginated.totalPages;

        this.setState({ currPage: toPage });
        fetch('/api/Data/GetCustomers/?page=' + toPage.toString())
            .then(response => response.json() as Promise<CustomersPaginated>)
            .then(data => {
                this.setState({ customersPaginated: data });
                this.setState({ currPage: toPage });
                this.forceUpdate();
                this.render();
            });

    }
    AddUpdate(c: Customer) {
        var isUpdate: boolean = c.customerId > 0;
        if (c.name == '') {
            this.setState({
                errMsg: 'Name is required to save/update',
                errCssClass: 'errFailure'
            });
            return;
        }
        var cs: Customer[] = this.state.customersPaginated.customers;
        fetch('/api/Data/CreateUpdateCust', {
            method: 'post',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(c)
        })
            .then(response => response.json() as Promise<Customer[]>)
            .then(data => {
                if (isUpdate) {
                    for (var i = 0; i < cs.length; i++) {
                        if (cs[i].customerId == c.customerId) {
                            cs[i] = data[0];
                        }
                    }
                }
                else {
                    cs.unshift(data[0]);
                    cs.pop();
                }

                var cp: CustomersPaginated = { customers: cs, totalPages: this.state.customersPaginated.totalPages };
                this.setState({ customersPaginated: cp });
                this.setState({
                    errMsg: 'Add/Update successful!',
                    errCssClass: 'errSuccess'
                });
            });

    }

    ResetForm() {
        this.setState({ currCustomer: TheHelpers.GetEmptyCustomer() });
    }
    FillFormForUpdate(c: Customer) {
        var c2: Customer = TheHelpers.GetEmptyCustomer();
        c2.customerId = c.customerId;
        c2.name = c.name;
        c2.address = c.address;
        c2.city = c.city;
        c2.state = c.state;
        c2.country = c.country;
        c2.email = c.email;
        this.setState({ currCustomer: c2 });
        this.render();
    }

}

export class AddEditCustomer extends React.Component<any, CustomerState> {
    constructor(props: any) {
        super(props);
    }
    render() {
        var c: Customer = this.props.customer;
        return (
            <div className="divAddNew">
                <h2>Add/Edit Customer</h2>
                <div> Id: {c.customerId}</div>
                <div> Name: <input type="text" value={c.name} onChange={(event) => { c.name = event.target.value; this.props.customer = c; this.forceUpdate(); }} /></div>
                <div> Address: <input type="text" value={c.address} onChange={(event) => { c.address = event.target.value; this.props.customer = c; this.forceUpdate(); }} /></div>
                <div> City: <input type="text" value={c.city} onChange={(event) => { c.city = event.target.value; this.props.customer = c; this.forceUpdate(); }} /></div>
                <div> State: <input type="text" value={c.state} onChange={(event) => { c.state = event.target.value; this.props.customer = c; this.forceUpdate(); }} /></div>
                <div> Country: <input type="text" value={c.country} onChange={(event) => { c.country = event.target.value; this.props.customer = c; this.forceUpdate(); }} /></div>
                <div> Email: <input type="text" value={c.email} onChange={(event) => { c.email = event.target.value; this.props.customer = c; this.forceUpdate(); }} /></div>
                <div>
                    <a onClick={() => this.ResetForm()}>Reset</a>
                    <button onClick={this.AddData.bind(this)}>Add/Update</button>
                </div>

            </div>);
    }

    AddData() {
        this.props.actionAdd(this.props.customer);
    }
    ResetForm() {
        this.props.actionReset(TheHelpers.GetEmptyCustomer());
    }

}
