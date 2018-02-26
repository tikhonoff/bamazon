var inquirer = require('inquirer');
var mysql = require('mysql');
const Table = require("le-table");
var myTable = new Table();

var connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '',
	database: 'bamazon'
});

function bamCli() {

	inquirer.prompt([
		{
			type: 'input',
			name: 'item_id',
			message: 'Enter the ID of the product would you like to buy',
			validate: validateInput,
			filter: Number
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many units of the product you would like to buy?',
			validate: validateInput,
			filter: Number
		}
	]).then(function(input) {
		var item_id = input.item_id;
		var quantity = input.quantity;
		var qryStr = 'SELECT * FROM products WHERE ?';

		connection.query(qryStr, {item_id: item_id}, function(err, data) {
			if (err) throw err;

			if (data.length === 0) {
				console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
				showStocks();

			} else {
				var productData = data[0];
				if (quantity <= productData.stock_quantity) {
					console.log('Congratulations, the product you requested is in stock! Placing order!');
					var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
					connection.query(updateQueryStr, function(err, data) {
						if (err) throw err;

						console.log('\nYour oder has been placed! Your total is $' + productData.price * quantity);
						connection.end();
					})
				} else {

                    showStocks();
					console.log('\nSorry, there is not enough product in stock, your order can not be placed as is.');
				}
			}
		})
	})
}


function validateInput(value) {


    var isValid = (parseFloat(value) % 1 === 0);
    return isValid || "Please enter correct number";

}
function showStocks() {
    qryStr = 
    "SELECT item_id, product_name, department_name, price, stock_quantity FROM bamazon.products ORDER BY  department_name";
	connection.query(qryStr, function(err, data) {
		if (err) throw err;

		console.log('The items available for sale: ');
        var headrs= ["N","Item ID" ,"Name of product","Department Name", "Price" ];//
        myTable.addRow(headrs, {
        hAlign: "center"
    });;


          for (let i = 0; i < data.length; ++i) {

            var arr = [[{
                text: data[i].item_id
                , data: {
                    hAlign: "center"
                }}
                
                ,{
                text: data[i].product_name
                , data: {
                    hAlign: "left"
                }}
                , 
                {
                text: data[i].department_name
                , data: {
                    hAlign: "left"
                }}
                , '$'+ data[i].price]];

             myTable.addRow([i+1].concat(arr[0]), {hAlign: "right"});
        }
        
        console.log(myTable.stringify()); 
	  	bamCli();
	})
}


function start() {
	showStocks();
}

start();