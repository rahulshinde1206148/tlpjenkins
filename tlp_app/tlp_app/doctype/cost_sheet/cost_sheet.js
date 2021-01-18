// Copyright (c) 2021, Indictrans and contributors
// For license information, please see license.txt
var total_fasteners = 0.0;
var total_weight = 0.0;
frappe.ui.form.on('Cost Sheet', {

	// refresh: function(frm){
 //        var total_weight = 0.0;
	    // $.each(frm.doc.cost_working_items, function(index, row){
	    // 	alert("sdddddddddddddd")
     //       total_weight += (row.finished_weight * row.qty)
     //       console.log("//////////////////total_weight", total_weight)
     //    });
     //    $.each(frm.doc.cost_sheet_items, function(index, row){
     //       row.total_weight = total_weight
     //    });

	// },
	
	
	assembly: function(frm){
		
		// $.each(frm.doc.cost_working_items, function(index, row){
	 //    	alert("sdddddddddddddd")
  //          total_weight += (row.finished_weight * row.qty)
  //          console.log("//////////////////total_weight", total_weight)
  //       });
       
  //     
		//add item on cost_sheet table
		frappe.call({
				method: "frappe.client.get",
				args:{
					doctype: "Item",
					filters: {'name': frm.doc.item_name}
				},
				callback:function(r) {
					if(r){
					var childTable = cur_frm.add_child("costsheet_items");
                      childTable.item_name=r.message.item_code
                      childTable.description=r.message.description
                      childTable.basic_rate = get_basic_rate(frm)

					}

					frm.refresh_fields("costsheet_items");
				}
			});


		    //   frappe.model.with_doc("BOM", frm.doc.assembly, function() {
	     //    var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
	     //    $.each(tabletransfer.items, function(index, row){
		    //         total_weight += row.qty row.finished_weight;
		       
      //       });
      //       if(total_weight){
      //       	frappe.model.set_value( "total_weight", r.message.finished_weight*r.message.qty);

      //       }
      //       frm.refresh_fields("cost_sheet_items");

	     // });
     //        $.each(frm.doc.cost_sheet_items, function(index, row){
     //        	alert("/////////////////////")
     //                console.log("##################### row.item_name",row.item_name)
	    //             frappe.call({
					// 	method: "frappe.client.get",
					// 	args:{
					// 		doctype: "Item",
					// 		filters: {'item_name': row.item_name}
					// },
					// callback:function(r) {
					// 	if(r){
					// 		console.log(">>>>>>>>>>>>>>>>>>>>> r.message.finished_weight * r.message.qty",r.message.finished_weight, r.message.qty)
					// 		total_weight += (r.message.finished_weight * r.message.qty)
					// 		console.log("///////////// total_weight", total_weight)
					// 	}
						
					// }

					// });
					// row.total_weight = total_weight
	    //         });


	       

		
        //add items on material cost items
        var semifinshed = 0;
        frappe.model.with_doc("BOM", frm.doc.assembly, function() {
        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
            
            $.each(tabletransfer.items, function(index, row){
            	if (row.is_semifinished == 1){
            		// frm.clear_table("material_cost_items")
                    var d = frm.add_child("material_cost_items");
	                d.ri_no = row.item_code;
	                d.description = row.description;
	                frappe.call({
						method: "frappe.client.get",
						args:{
							doctype: "Item",
							filters: {'item_code': row.item_code}
					},
					callback:function(r) {
						if(r){
							d.material_type = r.message.made_out_of;
							d.finished_weightkg = r.message.finished_weight;
							d.rough_weightkg = r.message.weight_per_unit;
							d.material_cost = r.message.valuation_rate * r.message.weight_per_unit;
						}
						frm.refresh_fields("material_cost_items");
					}
			});

	                semifinshed = 1;
	                frm.refresh_field("material_cost_items");
            	}
            });
            if(semifinished == 0){
            		frappe.throw({message:__("None of the items are semifinished from selected asssembly")});
            }
         });
        //add items on operation or labour items
        frappe.model.with_doc("BOM", frm.doc.assembly, function() {
	        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
	        $.each(tabletransfer.items, function(index, row){
	        	if (row.is_semifinished == 1){
	        		// frm.clear_table("operation_or_labour_items")
		            var d = frm.add_child("operation_or_labour_items");
		            d.ri_no = row.item_code;
		            d.description = row.description;
		            d.quantity = row.qty;
		            frappe.call({
						method: "frappe.client.get",
						args:{
							doctype: "Item",
							filters: {'item_code': row.item_code}
					},
					callback:function(r) {
						if(r){
							d.material_type = r.message.made_out_of;
							d.rough_weightkg = r.message.weight_per_unit;
						}
						frm.refresh_fields("operation_or_labour_items");
					}
					  });
	                
	            }
            });
	     });


        //add items on cost working items
        frappe.model.with_doc("BOM", frm.doc.assembly, function() {
	        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
	        var total_fasteners = 0.0;
	        var total_weight = 0.0;
	        $.each(tabletransfer.items, function(index, row){
	        	// frm.clear_table("cost_working_items")
	            var d = frm.add_child("cost_working_items");
	            d.ri_no = row.item_code;
	            d.description = row.description;
	            d.quantity = row.qty;
                d.is_semifinished = row.is_semifinished
                
              
                // d.finished_weight = row.finished_weight
                // console.log("/////////////// total_weight",row.finished_weight *row.qty )

	            frappe.call({
					method: "frappe.client.get",
					args:{
						doctype: "Item",
						filters: {'item_code': row.item_code}
					},
					callback:function(r) {
						if(r){
							// console.log("////////////////r", r.message)
							d.material_type = r.message.made_out_of;
							frm.refresh_fields("cost_working_items");

							if(r.message.valuation_rate && r.message.weight_per_unit){
								d.material_cost = r.message.valuation_rate * r.message.weight_per_unit;
							}
							else{
								frappe.throw({message:__("Please add valuation_rate and Rought weight in Item master for item", +(r.message.item_name)), title: __("Mandatory")});
							}
                            if(d.labour_cost){
								d.piece_rate = d.material_cost + d.labour_cost;
							}
							else{
								frappe.throw({message:__("Please add labour cost for item <b>{0}</b> on Cost Working Items table",[r.message.item_code]), title: __("Mandatory")});
							}
                          
						frm.refresh_fields("cost_working_items");
							}
					}
				});
	            frm.refresh_field("cost_working_items");
	        });
         
        });
       
	},

	

	

	// refresh: function(frm) {
        
	// 	console.log("/////////////// frm.doc.cost_working_items.length",frm.doc.cost_working_items.length)

	// 	$.each(frm.doc.cost_working_items, function(index,row){
	// 		me.frm.call({
	// 			method: "frappe.client.get",
	// 			args: {
	// 				doctype: "BOM Item",
	// 				parent: 'BOM',
	// 				filters: { name : row.ri_no, bo},
	// 			},
	// 			callback: function(r) {
	// 				console.log("sddddddddddd", r.message)
	// 				if(r.message.is_semifinished == 1) {
	// 					if(row.set_rate){
	// 						console.log("is_semifinished", row.set_rate)
	// 					frappe.model.set_value(cdt, cdn, "basic_rate", row.set_rate);
	// 					}
						
	// 				}
	// 				else{
	// 					frappe.model.set_value(cdt, cdn, "basic_rate", 0.0);
	// 				}
	// 			}
	// 		});
	// 		});	
	// 		refresh_field('items')
    // }

    // hideTheButtonWrapper = $('*[data-fieldname="costsheet_items"]');
    // hideTheButtonWrapper .find('.grid-add-row').hide();

	refresh:function(frm){
 		$(".grid-add-row").hide();
	}
	
});
 function get_basic_rate(frm){
   	console.log("///////////////get_basic_rate")
   	// var cost_working_details = frm.doc.cost_working_items;
			   var total_basic = 0
			 
			 //   for(var i in cost_working_details) {
			 //   	console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<< cost_working_details[i].basic_rate", cost_working_details[i].basic_rate)
				// total_basic = total_basic + cost_working_details[i].basic_rate
				// }
        if(frm.doc.cost_working_items){
        	$.each(frm.doc.cost_working_items, function(index,row){
				console.log("<<<<<<<<<<< row.basic_rate", row.basic_rate)
	            total_basic = total_basic + row.basic_rate
	        });
        }
        else{
        	// alert("//////hahahhahahahahah")
        }
		
				console.log("<<<<<<<<<<<<<<<<<<total_basic", total_basic)
				return total_basic
   }
 

cur_frm.fields_dict['item_name'].get_query = function(doc) {
	return{
		filters: [
			['Item','is_costsheet', '=' ,1]
		]
	}
};

cur_frm.fields_dict['assembly'].get_query = function(doc) {
	return{
		filters: [
			['BOM','is_assembly', '=' ,1],
			['BOM','item', '=' , doc.item_name],
			['BOM','is_default', '=' , 1],
		]
	}
};

frappe.ui.form.on('Cost Working Items', {

	labour_cost: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "piece_rate", d.material_cost + d.labour_cost);
	},
	piece_rate: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "set_rate", d.piece_rate * d.quantity);
	},
	percent_on_basic_rate_for_cost_rate:function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "cost_rate", ((d.basic_rate * d.percent_on_basic_rate_for_cost_rate)/100)+d.basic_rate);
	},
	percent_1: function(frm, cdt, cdn){

		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "amount_of_percent_1", ((d.cost_rate * d.percent_1)/100)+d.cost_rate);
	},
	percent_2: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "amount_of_percent_2", ((d.cost_rate * d.percent_2)/100)+d.cost_rate);
	},
	percent_3: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "amount_of_percent_3", ((d.cost_rate * d.percent_3)/100)+d.cost_rate);
	},
	set_rate: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		if (d.is_semifinished == 1){
           	   
            	if(d.set_rate){
            		console.log("is_semifinished", d.set_rate)
            		frappe.model.set_value(cdt, cdn, "basic_rate", d.set_rate);
            	}
            }
        else{
          if(d.set_rate){
          	frappe.model.with_doc("BOM", frm.doc.assembly, function() {
			        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
			        total_fasteners += d.set_rate
		        	if(d.idx == tabletransfer.items.length ){
			            frappe.model.set_value(cdt, cdn, "basic_rate",  total_fasteners);          
			        }
				});
        	}
        }
		
	 },
});


frappe.ui.form.on('Cost Sheet Items', {
	item_name: function(frm, cdt, cdn){
		alert("hahahhahahahahah")
		var d = locals[cdt][cdn];
        	var cost_working_details = frm.doc.cost_working_items;
			   var total_basic = 0.0;
			 
			   for(var i in cost_working_details) {
				total_basic = total_basic + cost_working_details[i].basic_rate
				console.log("<<<<<<<<<<<<<<<< total_basic", total_basic)
				}
						frappe.model.set_value(d.cdt, d.cdn, "basic_rate", total_basic);

				// frm.set_value("basic_rate",total_basic)
		// frappe.call({
		// 		method: "frappe.client.get",
		// 		args:{
		// 			ddoctype: "BOM Item",
		// 			parent: 'BOM',
		// 			filters: { item_name : d.item_name},
		// 		},
		// 		callback:function(r) {
		// 			if(r){
		// 				frappe.model.set_value(cdt, cdn, "total_weight", r.message.finished_weight*r.message.qty);
		// 			}

		// 			frm.refresh_fields("cost_sheet_items");
		// 		}
		// 	});
	}

});


