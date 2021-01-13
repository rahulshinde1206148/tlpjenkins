// Copyright (c) 2021, Indictrans and contributors
// For license information, please see license.txt

frappe.ui.form.on('Costsheet', {

	refresh: function(frm){
        var total_weight = 0.0;
	    $.each(frm.doc.cost_working_items, function(index, row){
	    	alert("sdddddddddddddd")
           total_weight += (row.finished_weight * row.qty)
           console.log("//////////////////total_weight", total_weight)
        });
        $.each(frm.doc.costsheet_items, function(index, row){
           row.total_weight = total_weight
        });

	},
	
	assembly: function(frm){
		var total_weight = 0.0;
		//add item on costsheet table
		frappe.call({
				method: "frappe.client.get_value",
				args:{
					doctype: "BOM",
					filters: {'name': frm.doc.assembly},
					fieldname: "item_name"
				},
				callback:function(r) {
					if(r){
					var childTable = cur_frm.add_child("costsheet_items");
                      childTable.item_name=r.message.item_name
                      // total_weight += (r.message.finished_weight * r.message.qty)
                      // console.log("////////////// total_weight", total_weight)
                      // childTable.total_weight = total_weight
					}
					frm.refresh_fields("costsheet_items");
				}
			});
        //add items on material cost items
        var semifinshed = 0;
        frappe.model.with_doc("BOM", frm.doc.assembly, function() {
        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
            
            $.each(tabletransfer.items, function(index, row){
            	if (row.is_semifinished == 1){
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
							d.material_type = r.message.item_group;
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
        //add items on cost working items
        frappe.model.with_doc("BOM", frm.doc.assembly, function() {
	        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
	        var total_fasteners = 0.0;
	        $.each(tabletransfer.items, function(index, row){
	            var d = frm.add_child("cost_working_items");
	            d.ri_no = row.item_code;
	            d.description = row.description;
	            d.quantity = row.qty;
                d.is_semifinished = row.is_semifinished
                d.finished_weight = row.finished_weight
                // console.log("/////////////// frm.doc.cost_working_items.length",frm.doc.cost_working_items.length)

	            frappe.call({
					method: "frappe.client.get",
					args:{
						doctype: "Item",
						filters: {'item_code': row.item_code}
					},
					callback:function(r) {
						if(r){
							d.material_type = r.message.item_group;
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
							 
						}
						frm.refresh_fields("cost_working_items");
					}
				});
	            frm.refresh_field("cost_working_items");
	        });
             
           // if (d.is_semifinished == 1){
           // 	   alert("haha")
           //  	if(d.set_rate){
           //  		d.basic_rate = d.set_rate;
           //  	}
           //  }
           //  else{
           //    if(d.set_rate){
           //  		total_fasteners +=  d.set_rate;
           //  	}
           //  }


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


	
});

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
        		total_fasteners +=  d.set_rate;
        		frappe.model.set_value(cdt, cdn, "basic_rate", total_fasteners);
        	}
        }

            // console.log("///////////////////d.index", d)
		 //   frappe.call({
			// 	method: "frappe.client.get",
			// 	args: {
			// 		doctype: "BOM Item",
			// 		parent: 'BOM',
			// 		filters: { name : d.item_code},
			// 	},
			// 	callback: function(r) {
			// 		console.log("sddddddddddd", r.message)
			// 		if(r.message.is_semifinished == 1) {
			// 			console.log("is_semifinished", d.set_rate)
			// 			frappe.model.set_value(cdt, cdn, "basic_rate", d.set_rate);
			// 		}
			// 		else{
			// 			frappe.model.set_value(cdt, cdn, "basic_rate", 0.0);
			// 		}
			// 	}
			// });





		
	 },
});

