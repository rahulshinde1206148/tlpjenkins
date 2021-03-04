// Copyright (c) 2021, Indictrans and contributors
// For license information, please see license.txt

frappe.ui.form.on('Competitor Rate', {
	// refresh: function(frm) {

	// }
});
// onchange event calculations of amount on rate and ordered_quantity
frappe.ui.form.on("Competitor Rate", "rate", function(frm) {
	frm.set_value("amount", flt(frm.doc.rate) * flt(frm.doc.ordered_quantity));
	frm.set_df_property("amount", "read_only" , 1)
  })
frappe.ui.form.on("Competitor Rate", "ordered_quantity", function(frm) {
	frm.set_value("amount", flt(frm.doc.rate) * flt(frm.doc.ordered_quantity));
	frm.set_df_property("amount", "read_only" , 1)
  })