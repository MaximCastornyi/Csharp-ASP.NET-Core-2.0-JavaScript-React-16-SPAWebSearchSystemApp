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

interface CustomerState {
    customersPaginated: CustomersPaginated;
    currCustomer: Customer;
    currPage: number;
    query: Query;
    orders: Order[];
}
interface Query {
    Name: string;
    Country: string;
}
class TheHelpers extends React.Component {
    static GetEmptyCustomer() {
        var c: Customer = { customerId: 0, name: '', address: '', city: '', state: '', country: '', email: '' };
        return c;
    }
}

export class CustomerSearch extends React.Component<any, CustomerState> {
    constructor(props: any) {
        super(props);
        this.state = { orders: [], query: { Name: '', Country: '' }, customersPaginated: { customers: [], totalPages: 1 }, currCustomer: TheHelpers.GetEmptyCustomer(), currPage: 1 };
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
                <h2> Search Customers</h2>
                <div className="divAddNew">
                    By name: <input
                        type="text"
                        id="name"
                        onChange={(event) => {
                            var name1: string = event.target.value;
                            var country1: string = this.state.query.Country;
                            this.setState({
                                query: { Name: name1, Country: country1 }
                            });
                            fetch('/api/Data/SearchCustomers/?name=' + name1 + '&' + 'country=' + country1)
                                .then(response => response.json() as Promise<CustomersPaginated>)
                                .then(data => {
                                    this.setState({ customersPaginated: data });
                                });

                            this.forceUpdate();
                            this.render();
                        }}

                    />
                </div>

                <div className="divAddNew">
                    By country: <input
                        type="text"
                        id="country"
                        onChange={(event) => {
                            var country1: string = event.target.value;
                            var name1: string = this.state.query.Name;
                            this.setState({
                                query: { Name: name1, Country: country1 }
                            });
                            fetch('/api/Data/SearchCustomers/?name=' + name1 + '&' + 'country=' + country1)
                                .then(response => response.json() as Promise<CustomersPaginated>)
                                .then(data => {
                                    this.setState({ customersPaginated: data });
                                });

                            this.forceUpdate();
                            this.render();
                        }}

                    />
                </div>
                <h2>Search Result</h2>
                <table className="listTab">
                    <thead>
                        <tr>
                            <td>Id</td>
                            <td>Name</td>
                            <td>Adress </td>
                            <td>City </td>
                            <td>State</td>
                            <td>Country</td>
                            <td>Email</td>
                            <td>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        {cs.map((c) =>
                            <tr key={c.customerId.toString()}>
                                <td>{c.customerId.toString()}</td>
                                <td>{c.name}</td>
                                <td>{c.address}</td>
                                <td>{c.city}</td>
                                <td>{c.state}</td>
                                <td>{c.country}</td>
                                <td>{c.email}</td>
                                <td><a onClick={() => this.ShowOrderDetails(c)}>View Orders</a> </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                <div>
                    <a onClick={() => this.ShowByPage('prev')}>Prev</a>
                    <select id='selPage' style={{ margin: '10px' }} onChange={(e) => this.ShowByPage(e.target.value)} value={this.state.currPage}>
                        {pageNums.map((i) => (
                            <option key={i} value={i}>{i}</option>
                        ))}
                    </select>
                    <a onClick={() => this.ShowByPage('next')}>Next</a>
                </div>

                <p /><br />
                <p /><br />
                <OrderDetails
                    theOrders={this.state.orders}
                    theCust={this.state.currCustomer}
                />
            </div>
        )
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
        //fetch('/api/Data/GetCustomers/?page=' + toPage.toString())
        fetch('/api/Data/SearchCustomers/?name=' + this.state.query.Name + '&' + 'country=' + this.state.query.Country + '&page=' + toPage.toString())
            .then(response => response.json() as Promise<CustomersPaginated>)
            .then(data => {
                this.setState({ customersPaginated: data });
                this.setState({ currPage: toPage });
                this.forceUpdate();
                this.render();
            });
    }
    ShowOrderDetails(c: Customer) {
        var custId = c.customerId;
        fetch('/api/Data/GetOrders?id=' + custId)
            .then(response => response.json() as Promise<Order[]>)
            .then(data => {
                //alert(JSON.stringify(data));
                this.setState({ orders: data });
                this.setState({ currCustomer: c });
                this.forceUpdate();
                this.render();
            });

    }

}


interface Product {
    orderId: number;
    productId: number;
    name: string;
    pic: string;
    price: string;
    quantity: number;
}

interface Order {
    orderId: number;
    products: Product[];
    orderDate: Date;
    totalPaid: number;
    custName: string;
}

interface OrderDetailsState {
    orders: Order[];
}

export class OrderDetails extends React.Component<any, OrderDetailsState> {

    constructor(props: any) {
        super(props);
    }

    render() {

        return (
            <div>
                <h2>Order Details for {this.props.theCust.name} </h2>
                {this.props.theOrders.map((o: Order) =>
                    <div key={o.orderId}>
                        <div className="orderId">Order Id: {o.orderId} </div>
                        <div>Order Date: {o.orderDate} </div>
                        <div>Total Paid: ${o.totalPaid} </div>
                        <div>Shipped to:
                                    {this.props.theCust.address}
                            {this.props.theCust.city},
                                    {this.props.theCust.state},
                                    {this.props.theCust.country}
                        </div>
                        <div className="prods">
                            {o.products.map((p) =>
                                <div className="prodeach" key={p.productId}>
                                    <div>Order Id: {p.name} </div>
                                    <div>Order Date: {p.quantity} </div>
                                    <div>Price each: ${p.price} </div>
                                    <div><img src={'/images/' + p.pic} /> </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        );
    }
}