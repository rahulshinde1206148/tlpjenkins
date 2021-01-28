// Copyright (c) 2021, Indictrans and contributors
// For license information, please see license.txt
var total_fasteners = 0.0;
var finished_weight = 0.0;
frappe.ui.form.on('Cost Sheet', {
	assembly: function(frm){
		frm.set_df_property('assembly', 'read_only', 1);
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
							d.material_type = r.message.made_out_of;
							d.finished_weightkg = r.message.finished_weight;
							d.rough_weightkg = r.message.weight_per_unit;
							d.material_cost = r.message.ab_8_melting_loss * r.message.weight_per_unit;
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
        var sum_of_operations = 0.0;
        frappe.model.with_doc("BOM", frm.doc.assembly, function() {
	        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
	        $.each(tabletransfer.items, function(index, row){
	        	if (row.is_semifinished == 1){
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
								d.casting = r.message.weight_per_unit * r.message.ab_casting_rate;
								d.galvanization = r.message.finished_weight * r.message.galvanization_charges;
								if (d.casting){
									sum_of_operations = sum_of_operations + d.casting
								}
								if (d.galvanization){
									sum_of_operations = sum_of_operations + d.galvanization
								}
								if (d.drilling){
									sum_of_operations = sum_of_operations + d.drilling
								}
								if (d.bending){
									sum_of_operations = sum_of_operations + d.bending
								}
								if (d.maching){
									sum_of_operations = sum_of_operations + d.maching
								}
								if (d.welding){
									sum_of_operations = sum_of_operations + d.welding
								}
								if (d.forging){
									sum_of_operations = sum_of_operations + d.forging
								}
								if (d.file){
									sum_of_operations = sum_of_operations + d.file
								}
								if (d.die){
									sum_of_operations = sum_of_operations + d.die
								}
								if (d.miscellaneous){
									sum_of_operations = sum_of_operations + d.miscellaneous
								}
								d.labour_cost = sum_of_operations * r.message.cost_on_labour_factor
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
	            var d = frm.add_child("cost_working_items");
	            d.ri_no = row.item_code;
	            d.description = row.description;
	            d.quantity = row.qty;
                d.is_semifinished = row.is_semifinished
               
	            frappe.call({
					method: "frappe.client.get",
					args:{
						doctype: "Item",
						filters: {'item_code': row.item_code}
					},
					callback:function(r) {
						if(r){
							d.material_type = r.message.made_out_of;
							frm.refresh_fields("cost_working_items");
							d.material_cost =  r.message.ab_8_melting_loss * r.message.weight_per_unit;
							$.each(frm.doc.operation_or_labour_items , function(index, row){
								frm.refresh_fields("cost_working_items");
								if(row.ri_no == d.ri_no){
									d.labour_cost = row.labour_cost
									frm.refresh_fields("cost_working_items");
								}
						    });
                            if(d.labour_cost){
								d.piece_rate = d.material_cost + d.labour_cost;
							}
							if(d.piece_rate){
								d.set_rate = d.piece_rate * d.quantity;
							}

						frm.refresh_fields("cost_working_items");
							}
					}
				});
	            frm.refresh_field("cost_working_items");
	        });
        });
	},
	refresh:function(frm){
 		$(".grid-add-row").hide();
	}
	
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
			['BOM','is_default_assembly', '=' , 1]
		]
	}
};

frappe.ui.form.on('Costsheet Items', {
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
	}
});
frappe.ui.form.on('Cost Working Items', {
	labour_cost: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "piece_rate", d.material_cost + d.labour_cost);
	},
	piece_rate: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "set_rate", d.piece_rate * d.quantity);
	},
	basic_rate:function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "cost_rate", ((d.basic_rate * d.percent_on_basic_rate_for_cost_rate)/100)+d.basic_rate);
	},
	percent_on_basic_rate_for_cost_rate:function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "cost_rate", ((d.basic_rate * d.percent_on_basic_rate_for_cost_rate)/100)+d.basic_rate);
	},
	cost_rate: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.model.set_value(cdt, cdn, "amount_of_percent_1", ((d.cost_rate * d.percent_1)/100)+d.cost_rate);
		frappe.model.set_value(cdt, cdn, "amount_of_percent_2", ((d.cost_rate * d.percent_2)/100)+d.cost_rate);
		frappe.model.set_value(cdt, cdn, "amount_of_percent_3", ((d.cost_rate * d.percent_3)/100)+d.cost_rate);
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
			        else{
			        	frappe.model.set_value(cdt, cdn, "basic_rate",  0);  
			        }
				});
        	}
        }
		
	 },
});
