frappe.ui.form.on('Item', {
	item_group: function(frm){
		cur_frm.fields_dict['made_out_of'].get_query = function(doc) {
			return{
				filters: [
					['Made Out Of','item_group', '=' ,frm.doc.item_group]
				]
			}
		};
		
	},
	setup: function(frm){
		frappe.call({
				method: "frappe.client.get_value",
				args:{
					doctype: "Made Out Of",
					filters: {'item_group': frm.doc.item_group},
					fieldname: "made_out_of"
				},
				callback:function(r) {
					if(r){
						frappe.model.set_value(frm.doc.doctype, frm.doc.name, "made_out_of", r.message.made_out_of);
					}

					frm.refresh_fields("made_out_of");
				}
			});

		frappe.call({
			method: "frappe.client.get_value",
			args:{
				doctype: "Ferrous",
				filters: {parameter: 'Galvanising Charge'},
				parent: "TLP Setting Page",
				fieldname: "rskg"
		    },
			callback:function(r) {
				if(r){
					frappe.model.set_value(frm.doc.doctype, frm.doc.name, "galvanization_charges" ,r.message.rskg)
				    frappe.click_button('Save')
				}
				frm.refresh_fields("galvanization_charges");
			}
		});
		frappe.call({
			method: "frappe.client.get_value",
			args:{
				doctype: "Aluminium Bronze",
				filters: {parameter: 'AB Casting rate for GENERAL items (CR1)'},
				parent: "TLP Setting Page",
				fieldname: "rskg"
		    },
			callback:function(r) {
				if(r){
					frappe.model.set_value(frm.doc.doctype, frm.doc.name, "ab_casting_rate" ,r.message.rskg)
					frappe.click_button('Save')
				}
				frm.refresh_fields("ab_casting_rate");
			}
		});

	}

});