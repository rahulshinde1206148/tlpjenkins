frappe.ui.form.on("Quotation", {
	letter_template : function(frm){
		if(frm.doc.letter_template){
           return frappe.call({
				method: 'tlp_app.tlp_app.custom_scripts.quotation.quotation.get_print_details',
				args: {
					template_name: frm.doc.letter_template,
				},
				callback: function(r) {
					if(r.message){
						frm.set_value("letter_detail",r.message)
					}
				}
			});
		}
	},
	notes_template : function(frm){
		if(frm.doc.notes_template){
           return frappe.call({
				method: 'tlp_app.tlp_app.custom_scripts.quotation.quotation.get_notes_details',
				args: {
					template_name: frm.doc.notes_template,
				},
				callback: function(r) {
					if(r.message){
						frm.set_value("notes_details",r.message)
					}
				}
			});
		}
	},
	refresh(frm) {
		frm.fields_dict["items"].grid.add_custom_button(__('Add Assembly'), 
		function() {
			var d = new frappe.ui.Dialog({
						'fields': [
							{'fieldname': 'ht', 'fieldtype': 'HTML'},
							{'fieldname': 'select_item',
							 'fieldtype': 'Link',
							 "options":  "Item",
							 "get_query": function () {
									return {
										filters: [['Item', 'is_costsheet','=', 1]]
										}
								}}
						],
						primary_action: function(){
							d.hide();
							show_alert(d.get_values());
						}
					});
					d.fields_dict.ht.$wrapper.html('Select Item');
					d.show();
				})}
});

