using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Data.SqlClient;
using SPAWebSearchSystemApp.Model;

namespace SPAWebSearchSystemApp.Controllers
{
    [Route("api/[controller]")]
    public class DataController : Controller
    {
        IConfiguration _config;
        public DataController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost("[action]")]
        public IEnumerable<Customer> CreateUpdateCust([FromBody] Customer c)
        {
            string connStr = _config.GetSection("ConnectionStrings").GetSection("SPAWebSearchSystemAppDatabase").Value;
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                SqlCommand cmd = new SqlCommand();
                conn.Open();
                cmd = new SqlCommand("[sp_CreateOrUpdateCustomer]", conn);

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add("@customerId", SqlDbType.NVarChar).Value = c.CustomerId;
                cmd.Parameters.Add("@name", SqlDbType.NVarChar).Value = c.Name;
                cmd.Parameters.Add("@address", SqlDbType.NVarChar).Value = c.Address;
                cmd.Parameters.Add("@city", SqlDbType.NVarChar).Value = c.City;
                cmd.Parameters.Add("@state", SqlDbType.NVarChar).Value = c.State;
                cmd.Parameters.Add("@country", SqlDbType.NVarChar).Value = c.Country;
                cmd.Parameters.Add("@email", SqlDbType.NVarChar).Value = c.Email;
                SqlDataReader reader = null;
                reader = cmd.ExecuteReader();
                reader.Read();
                c.CustomerId = Convert.ToInt32(reader["new_id"].ToString());
            }

            List<Customer> listCust = new List<Customer>();
            listCust.Add(c);
            return listCust;
        }


        [HttpGet("[action]")]
        public CustomersPaginated GetCustomers(int Page = 1)
        {
            string connStr = _config.GetSection("ConnectionStrings").GetSection("SPAWebSearchSystemAppDatabase").Value;

            List<Customer> cust = new List<Customer>();
            int totalPages = 0;
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                SqlCommand cmd = new SqlCommand();
                conn.Open();
                cmd = new SqlCommand("sp_GetCustomers", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add("@pageNum", SqlDbType.Int).Value = Page;
                cmd.Parameters.Add("@pageSize", SqlDbType.Int).Value = 5;

                SqlDataReader reader = null;

                reader = cmd.ExecuteReader();

                reader.Read();

                totalPages = Convert.ToInt32(reader["totalPages"].ToString());

                reader.NextResult();
                while (reader.Read())
                {
                    Customer c = new Customer
                    {
                        CustomerId = Convert.ToInt32(reader["CustomerId"].ToString()),
                        Name = reader["Name"].ToString(),
                        Address = reader["Address"].ToString(),
                        City = reader["City"].ToString(),
                        State = reader["State"].ToString(),
                        Country = reader["Country"].ToString(),
                        Email = reader["Email"].ToString()
                    };
                    cust.Add(c);

                }

                return new CustomersPaginated { Customers = cust, TotalPages = totalPages };


            }


        }

        [HttpGet("[action]")]
        public CustomersPaginated SearchCustomers(int page = 1)
        {
            string queryKeyVal = ControllerContext.HttpContext.Request.QueryString.ToString();

            string[] qs = queryKeyVal.Split("&".ToCharArray());
            string name = qs[0].Split("=".ToCharArray())[1];
            string country = qs[1].Split("=".ToCharArray())[1];
            //int page = 1;
            if (qs.Length == 3)
                page = Convert.ToInt32(qs[2].Split("=".ToCharArray())[1]);

            List<Customer> cust = new List<Customer>();
            string connStr = _config.GetSection("ConnectionStrings").GetSection("SPAWebSearchSystemAppDatabase").Value;
            int totalPages = 0;
            using (SqlConnection conn = new SqlConnection(connStr))
            {
                SqlCommand cmd = new SqlCommand();
                conn.Open();
                cmd = new SqlCommand("[sp_SearchCustomers]", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add("@name", SqlDbType.NVarChar).Value = name;
                cmd.Parameters.Add("@country", SqlDbType.NVarChar).Value = country;
                cmd.Parameters.Add("@pageNum", SqlDbType.Int).Value = page;
                SqlDataReader reader = null;
                reader = cmd.ExecuteReader();
                reader.Read();
                totalPages = Convert.ToInt32(reader["TotalPages"].ToString());

                reader.NextResult();
                while (reader.Read())
                {
                    Customer c = new Customer
                    {

                        CustomerId = Convert.ToInt32(reader["CustomerId"].ToString()),
                        Name = reader["Name"].ToString(),
                        Address = reader["address"].ToString() == null ? "" : reader["address"].ToString(),
                        City = reader["city"].ToString() == null ? "" : reader["city"].ToString(),
                        State = reader["state"].ToString() == null ? "" : reader["state"].ToString(),
                        Country = reader["Country"].ToString() == null ? "" : reader["Country"].ToString(),
                        Email = reader["email"].ToString() == null ? "" : reader["email"].ToString(),

                    };
                    cust.Add(c);

                }

            }

            return new CustomersPaginated { Customers = cust, TotalPages = totalPages };

        }

        [HttpGet("[action]")]
        public IEnumerable<Order> GetOrders(int id)
        {
            List<Order> orders = new List<Order>();
            string connStr = _config.GetSection("ConnectionStrings").GetSection("SPAWebSearchSystemAppDatabase").Value;

            using (SqlConnection conn = new SqlConnection(connStr))
            {
                SqlCommand cmd = new SqlCommand();
                conn.Open();
                cmd = new SqlCommand("[sp_GetOrders]", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add("@CustId", SqlDbType.Int).Value = id;
                SqlDataReader reader = null;
                reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    Order order = new Order
                    {
                        CustName = "",//reader["CustName"].ToString(),
                        OrderId = Convert.ToInt32(reader["OrderId"].ToString()),
                        OrderDate = Convert.ToDateTime(reader["OrderDate"].ToString()),
                        TotalPaid = Convert.ToDouble(reader["TotalUSD"].ToString()),
                        Products = new List<Product>()
                    };
                    orders.Add(order);

                }

                reader.NextResult();

                while (reader.Read())
                {
                    Product p =
                        new Product()
                        {
                            OrderId = (int)reader["OrderId"],
                            ProductId = (int)reader["ProductId"],
                            Name = (string)reader["Name"],
                            Pic = (string)reader["Picture"],
                            Price = Convert.ToDouble(reader["Price"].ToString()),
                            Quantity = (int)reader["Quantity"]
                        };
                    orders.Find(ord => ord.OrderId == p.OrderId).Products.Add(p);
                }
            }
            return orders;
        }

    }
}
