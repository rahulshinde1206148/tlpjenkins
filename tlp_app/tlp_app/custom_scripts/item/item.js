frappe.ui.form.on('Item', {
	item_group: function(frm){
		cur_frm.fields_dict['made_out_of'].get_query = function(doc) {
			return{
				filters: [
					['Made Out Of','item_group', '=' ,frm.doc.item_group]
				]
			}
		};
		frappe.call({
			method: "frappe.client.get_value",
			args:{
				doctype: "Made Out Of",
				filters: {'item_group': frm.doc.item_group},
				fieldname: "made_out_of"
			},
			callback:function(r) {
				if(r){
					frm.set_value("made_out_of", r.message.made_out_of);
				}
			}
		});
	},
	is_fastners: function(frm){
		if(frm.doc.is_fastners == 1){
			cur_frm.fields_dict['fasteners_type'].get_query = function(doc) {
				return{
					filters: [
						['Fasteners Type','made_out_of', '=' ,frm.doc.made_out_of]
					]
				}
			};
		}
		
	},
	setup:function(frm){
		frappe.model.with_doc("TLP Setting Page", "TLP-Setting-00001", function() {
	        var table= frappe.model.get_doc("TLP Setting Page", "TLP-Setting-00001")
	        $.each(table.ferrous, function(index, row){
	        	if (row.parameter == 'Galvanising Charge'){
	        		frm.doc.galvanization_charges = row.rskg
	        	}
	        });	
	        $.each(table.aluminium_bronze, function(index, row){
	        	if (row.parameter == 'AB Alloy (AB) + 8% Melting Loss'){
	        		// frm.doc.ab_8_melting_loss = row.rskg
	        		frm.set_value('ab_8_melting_loss', row.rskg)
	        	}
	        	if (row.parameter == 'AB Casting rate for GENERAL items (CR1)'){
	        		// frm.doc.ab_casting_rate = row.rskg
	        		frm.set_value('ab_casting_rate', row.rskg)
	        	}
	        });	
	        console.log("<<<<<<<<<<<< table.cost_on_labour_factor", table.cost_on_labour_factor)
	        if (table.cost_on_labour_factor){
        		// frm.doc.cost_on_labour_factor = table.cost_on_labour_factor
        		frm.set_value("cost_on_labour_factor", table.cost_on_labour_factor)
        	}
        	frm.save();
	    });
	}

});