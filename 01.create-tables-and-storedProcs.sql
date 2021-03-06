USE [SPAWebSearchSystemApp]
GO
/****** Object:  Table [dbo].[Customer]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Customer](
	[CustomerId] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](50) NOT NULL,
	[Address] [varchar](50) NOT NULL,
	[State] [varchar](50) NOT NULL,
	[City] [varchar](50) NOT NULL,
	[Country] [varchar](50) NOT NULL,
	[Email] [nvarchar](50) NULL,
 CONSTRAINT [PK_Customer] PRIMARY KEY CLUSTERED 
(
	[CustomerId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [dbo].[CustomerOrder]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CustomerOrder](
	[OrderId] [int] IDENTITY(1,1) NOT NULL,
	[CustomerId] [int] NOT NULL,
	[OrderDate] [date] NOT NULL,
	[TotalUSD] [float] NULL,
 CONSTRAINT [PK_Order] PRIMARY KEY CLUSTERED 
(
	[OrderId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[OrderProduct]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OrderProduct](
	[OrderId] [int] NOT NULL,
	[ProductId] [int] NOT NULL,
	[Quantity] [int] NOT NULL,
 CONSTRAINT [PK_OrderProduct] PRIMARY KEY CLUSTERED 
(
	[OrderId] ASC,
	[ProductId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [dbo].[Product]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [dbo].[Product](
	[ProdId] [int] IDENTITY(1,1) NOT NULL,
	[Name] [varchar](50) NOT NULL,
	[Price] [float] NOT NULL,
	[Picture] [varchar](50) NULL,
 CONSTRAINT [PK_Product] PRIMARY KEY CLUSTERED 
(
	[ProdId] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  StoredProcedure [dbo].[sp_CreateOrUpdateCustomer]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 
-- =============================================
CREATE PROCEDURE [dbo].[sp_CreateOrUpdateCustomer]
	@customerId int,
	@name nvarchar(50),
	@address  nvarchar(50)=null,
	@city  nvarchar(50)=null,
	@state  nvarchar(50)=null,
	@country  nvarchar(50)=null,
	@email nvarchar(50)= null  
AS
BEGIN 
	SET NOCOUNT ON; 
	if(@customerId > 0)
	begin
		UPDATE Customer set 
			name=@name, Address=@Address, State=@State, City=@City, country=@country, Email=@Email
			where customerId=@customerId
		SELECT @customerId as new_id
	end
	else
	begin
		Insert into Customer (name, [Address], City, [State], Country, Email) 
		values(@name, @Address, @City, @State, @Country, @Email)
		SELECT SCOPE_IDENTITY() as new_id
	end 

	 
 



END


GO
/****** Object:  StoredProcedure [dbo].[sp_DeleteCustomer]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 
-- =============================================
CREATE PROCEDURE [dbo].[sp_DeleteCustomer]
	 @id int
AS
BEGIN 
	SET NOCOUNT ON; 
	DELETE from Customer where CustomerId=@id;
END


GO
/****** Object:  StoredProcedure [dbo].[sp_GetCustomers]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 -- sp_GetCustomers 2,5
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetCustomers]
	  @pageNum int =1,
	  @pageSize int = 5 
AS
BEGIN 
	SET NOCOUNT ON; 
	declare @total int
	select @total = count(*) from Customer
	 
	select CEILING (cast(@total as float)/ cast(@pageSize  as float)) TotalPages;

	select top 5 * from Customer 
		where CustomerId not in (select top ((@pageNum-1)*@pageSize) CustomerId from Customer)

END 
GO
/****** Object:  StoredProcedure [dbo].[sp_GetOrders]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 -- [sp_GetOrders] 1
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetOrders]
	  @CustId int =1 
AS
BEGIN 
	SET NOCOUNT ON; 
	 
	select  * from  CustomerOrder  where CustomerId=@CustId  

	 select  op.*, p.Name, p.Picture,p.Price from [orderProduct] op left join Product p
	 on p.ProdId=op.ProductId
	 where orderid in(select orderid from customerorder where CustomerId=@CustId)
END 

GO
/****** Object:  StoredProcedure [dbo].[sp_SearchCustomers]    Script Date: 10/19/2017 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
 -- [sp_SearchCustomers] 'a','',3
-- =============================================
CREATE PROCEDURE [dbo].[sp_SearchCustomers]
	 @name nvarchar(50)='',
	 @country nvarchar(50)='',
	 @pageNum int =1,
	 @pageSize int = 5 

AS
BEGIN 
	SET NOCOUNT ON;  
	--select  top 5 * from Customer 
	--where Name like '' + @name + '%' and country like '' + @country + '%'



    declare @total int
	select @total = count(*) from Customer where Name like '' + @name + '%' and country like '' + @country + '%'
	 
	select CEILING (cast(@total as float)/ cast(@pageSize  as float)) TotalPages;

	select top 5 * from Customer 
		where Name like '' + @name + '%' and country like '' + @country + '%'
		and CustomerId not in (select top ((@pageNum-1)*@pageSize) CustomerId from Customer
		where Name like '' + @name + '%' and country like '' + @country + '%')
END


GO
