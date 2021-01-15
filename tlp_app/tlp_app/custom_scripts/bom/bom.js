// frappe.ui.form.on('BOM Items', {
	// item_code: function(frm, cdt, cdn){
	// 	alert("<<<<<<<<<<<<<<<<<<")
	// 	var d = locals[cdt][cdn];
	// 	frappe.call({
	// 			method: "frappe.client.get_value",
	// 			args:{
	// 				doctype: "Item",
	// 				filters: {'name': frm.doc.item_code},
	// 				fieldname: "finished_weight"
	// 			},
	// 			callback:function(r) {
	// 				if(r){
	// 					frappe.model.set_value(cdt, cdn, "finished_weight", r.message.finished_weight);
	// 				}

	// 				frm.refresh_fields("bom_items");
	// 			}
	// 		});
		
	// }

// });