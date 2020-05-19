using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SPAWebSearchSystemApp.Model
{
    public class Order
    {
        public int OrderId { get; set; }
        public List<Product> Products { get; set; }
        public DateTime OrderDate { get; set; }
        public double TotalPaid { get; set; }
        public string CustName { get; set; }

    }
}
