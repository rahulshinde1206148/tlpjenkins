
frappe.ui.form.on("Quotation Item", "margin_value", function(frm, doctype, name) {
	  var row = locals[doctype][name];
	  row.margin_value = row.margin_value * 100;
	  refresh_field("items");
	});