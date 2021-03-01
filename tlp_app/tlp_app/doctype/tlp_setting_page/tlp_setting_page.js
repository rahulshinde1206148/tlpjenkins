// Copyright (c) 2021, Indictrans and contributors
// For license information, please see license.txt

frappe.ui.form.on('TLP Setting Page', {
	onload: function(frm) {
		var ab_alloy = 0.0;
		$.each(frm.doc.aluminium_bronze, function(index, row){
		 	if (row.parameter == 'Copper' || row.parameter == 'Aluminium (Pure)' || row.parameter == 'Manganese' || row.parameter == 'Iron boring' ){
		 		if (row.rskg && row.percent){
			 		ab_alloy = ab_alloy+ (row.rskg * row.percent)/ 100
		 		}
		 	}
		 	if (row.parameter == 'AB Alloy'){
		 		row.rskg = ab_alloy
		 		var df = frappe.meta.get_docfield("Aluminium Bronze","rskg",  cur_frm.doc.name);
                df.read_only = 1;
		 	}
		 	if((row.parameter).includes('AB Alloy (AB) +') && (row.parameter).includes('Melting Loss')){
                 row.rskg = ab_alloy * ((100+ row.percent)/100)
                 frm.save()
                 var df = frappe.meta.get_docfield("Aluminium Bronze","rskg",  cur_frm.doc.name);
                df.read_only = 1;
		 	}
		});
		if(frm.doc.labour_factor){
			frm.set_value('cost_on_labour_factor', (frm.doc.labour_factor+100)/100)
			frm.set_df_property("cost_on_labour_factor", "read_only" , 1)
		}
		if(frm.doc.overheads){
			frm.set_value('cost_on_overheads', (frm.doc.overheads+100)/100)
			frm.set_df_property("cost_on_overheads", "read_only" , 1)
		}
	}

});
