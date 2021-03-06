frappe.ui.form.on('Item', {
	refresh: function(frm){
		// if(frm.doc.casting_parameter){
		// 	frm.set_df_property('galvanization_parameter', 'hidden', 1);
		// }
		// if(frm.doc.galvanization_parameter){
		// 	frm.set_df_property('casting_parameter', 'hidden', 1);
		// }
	},
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
	// Toggling Between Casting and Galvanization Parameter
	casting_parameter: function(frm){
		if(frm.doc.casting_parameter){
			console.log(frm.doc.casting_parameter)
			frm.toggle_display("galvanization_parameter", false);
		}
		else{
			frm.toggle_display("galvanization_parameter", true);
		}
	},
	galvanization_parameter: function(frm){
		if(frm.doc.galvanization_parameter){
			console.log(frm.doc.casting_parameter)
			frm.toggle_display("casting_parameter", false);
		}
		else{
			frm.toggle_display("casting_parameter", true);
		}
	},
});