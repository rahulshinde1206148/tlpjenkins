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

					frm.refresh_fields("item");
				}
			});
		
	}

});