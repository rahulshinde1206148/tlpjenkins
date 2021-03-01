frappe.ui.form.on('BOM Items', {
	item_code: function(frm, cdt, cdn){
		var d = locals[cdt][cdn];
		frappe.call({
				method: "frappe.client.get_value",
				args:{
					doctype: "Item",
					filters: {'name': frm.doc.item_code},
					fieldname: "is_fastners"
				},
				callback:function(r) {
					if(r){
						frappe.model.set_value(cdt, cdn, "is_fastners", r.message.is_fastners);
					}

					frm.refresh_fields("bom_items");
				}
			});
		
	}

});