// Copyright (c) 2021, Indictrans and contributors
// For license information, please see license.txt
var total_fasteners = 0.0;
var finished_weight = 0.0;
var cost_on_labour_factor = 0.0
var ab_8_melting_loss = 0.0
var galvanization_charges = 0.0
var casting_charges = 0.0
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

                      childTable.ri_no=r.message.item_code
                      childTable.description=r.message.description
					}
					frm.refresh_fields("costsheet_items");
				}
			});
        //add items on material cost items
        frappe.model.with_doc("BOM", frm.doc.assembly, function() {
        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
            $.each(tabletransfer.items, function(index, row){
            	if (row.is_fasteners== 0){
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
							d.material_cost = ab_8_melting_loss * r.message.weight_per_unit;
						}
						frm.refresh_fields("material_cost_items");
					}
			});
	                frm.refresh_field("material_cost_items");
            	}
            });
           
         });
        //add items on operation or labour items
        frappe.model.with_doc("BOM", frm.doc.assembly, function() {
	        var tabletransfer= frappe.model.get_doc("BOM", frm.doc.assembly)
	        $.each(tabletransfer.items, function(index, row){
	        	if (row.is_fasteners == 0){
		            var d = frm.add_child("operation_or_labour_items");
		            d.ri_no = row.item_code;
		            d.description = row.description;
		            d.quantity = row.qty;
		            get_operations_data(frm);

		            frappe.call({
						method: "frappe.client.get",
						args:{
							doctype: "Item",
							filters: {'item_code': row.item_code}
					    },
						callback:function(r) {
							if(r){
								get_parameters_cost(r.message.galvanization_parameter,r.message.casting_parameter)
								d.material_type = r.message.made_out_of;
								d.rough_weightkg = r.message.weight_per_unit;
								
								d.casting = r.message.weight_per_unit * casting_charges ;
								d.galvanization = r.message.finished_weight * galvanization_charges ;
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
                d.is_fasteners = row.is_fasteners;
               
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
							d.material_cost = ab_8_melting_loss * r.message.weight_per_unit;
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
 		get_ab_8_melting_loss(frm);
	}
	
});

var get_ab_8_melting_loss = function(frm) {
	frappe.model.with_doc("TLP Setting Page", "TLP-Setting-00001", function() {
		var table= frappe.model.get_doc("TLP Setting Page", "TLP-Setting-00001")
        $.each(table.aluminium_bronze, function(index, row){
        	if ((row.parameter).includes('AB Alloy (AB) +') && (row.parameter).includes('Melting Loss')){
        		ab_8_melting_loss = row.rskg;
        	}
        });	
    });
};

var get_parameters_cost = function(galvanization_parameter,casting_parameter ){
	frappe.model.with_doc("TLP Setting Page", "TLP-Setting-00001", function() {
        var table= frappe.model.get_doc("TLP Setting Page", "TLP-Setting-00001")
        $.each(table.ferrous, function(index, row){
        	if (row.parameter == galvanization_parameter){
        		galvanization_charges = row.rskg
        	}
        	if (row.parameter == casting_parameter){
        		casting_charges = row.rskg
        	}
        });	
        $.each(table.aluminium, function(index, row){
        	if (row.parameter == galvanization_parameter){
        		galvanization_charges = row.rskg
        	}
        	if (row.parameter == casting_parameter){
        		casting_charges = row.rskg
        	}
        });	
        $.each(table.aluminium_bronze, function(index, row){
        	if (row.parameter == galvanization_parameter){
        		galvanization_charges = row.rskg
        	}
        	if (row.parameter == casting_parameter){
        		casting_charges = row.rskg
        	}
        });	
    });
};

var get_operations_data = function(frm) {
	$.each(frm.doc.operation_or_labour_items, function(index, row){
	    frappe.call({
			method: "frappe.client.get",
			args:{
				doctype: "Opearation Cost Setting",
				filters: {'ri_no': row.ri_no}
		    },
			callback:function(r) {
				if(r){
					if (r.message.drilling){
	                   row.drilling = r.message.drilling;
		        	}
		        	if (r.message.bending){
	                   row.bending = r.message.bending;
		        	}
		        	if (r.message.welding){
	                   row.welding = r.message.welding;
		        	}
		        	if (r.message.machining){
	                   row.maching = r.message.machining;
		        	}
		        	if (r.message.forging){
	                   row.forging = r.message.forging;
		        	}
		        	if (r.message.file){
	                   row.file = r.message.file;
		        	}
		        	if (r.message.die){
	                   row.die = r.message.die;
		        	}
		        	if (r.message.miscellaneous){
	                   row.miscellaneous = r.message.miscellaneous;
		        	}
				}
				else{
					frappe.msgprint(__("Please add operation cost on Opearation Cost Setting"))
				}
				frm.refresh_fields("operation_or_labour_items");
			}
		});
	});
};

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
		if (d.is_fasteners == 0){
           	   
            	if(d.set_rate){
            		// console.log("is_semifinished", d.set_rate)
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
