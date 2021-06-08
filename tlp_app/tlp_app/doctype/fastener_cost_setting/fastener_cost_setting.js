// Copyright (c) 2021, Indictrans and contributors
// For license information, please see license.txt

frappe.ui.form.on('Fastener Cost Setting', {
	refresh: function(frm) {
		cur_frm.fields_dict['ri_no'].get_query = function(doc) {
		return{
			filters: [
				['Item','is_fasteners', '=' ,1]
			]
		}
	};

	}
});
