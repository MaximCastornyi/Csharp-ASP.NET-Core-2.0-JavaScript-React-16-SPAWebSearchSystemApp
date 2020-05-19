using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SPAWebSearchSystemApp.Model
{
    public class Product
    {
        public int OrderId { get; set; }
        public int ProductId { get; set; }
        public string Name { get; set; }
        public string Pic { get; set; }
        public double Price { get; set; }
        public int Quantity { get; set; }

    }
}
