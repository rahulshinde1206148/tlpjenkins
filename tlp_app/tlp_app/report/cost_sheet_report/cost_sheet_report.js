// Copyright (c) 2016, Indictrans and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Cost Sheet Report"] = {
	"filters": [
		{
			"fieldname":"select_parameter_for_updating_cost",
			"label": __("Select Parameter for Updating Cost"),
			"fieldtype": "Link",
			"options": "Parameter Group",
			"on_change": function(query_report) {
				var parameter_group = frappe.query_report.get_filter_value('select_parameter_for_updating_cost')
				if (parameter_group){
					this.data = [];
					var d = new frappe.ui.Dialog({
					title: __("Cost of Parameters "),
					fields: [
						{
							fieldname: "cost_of_parameters", fieldtype: "Table",
							in_place_edit: true, data: this.data,
							get_data: () => {
									
									
								return this.data;
							},
							fields: [{
								fieldtype:'Data',
								fieldname:"docname",
								hidden: 1
							}, 
							{
								fieldtype:'Link',
								fieldname:"parameters",
								options: 'Parameters',
								in_list_view: 1,
								label: __('Parameters'),
								default: 'Copper',
								"get_query": function () {
									return {
										filters: [
											["Parameters", "parameter_group", "=", parameter_group]
										]
									};
								},
								"on_change": function() {
									console.log("/////a")
									// const item_code = this.get_value();
									// const warehouse = this.grid_row.on_grid_fields_dict.warehouse.get_value();
									frappe.call({
										method: "frappe.client.get_value",
										args:{
											doctype: "Parameters",
											filters: {'parameter_group': parameter_group}
										},
										callback: (r) => {
											console.log("///////r", r.message)
											this.grid_row.on_grid_fields_dict
												.parameters.set_value(r.message || 0);
										}
									})
									
								},
							},
							]

							// 'fieldname': 'cost_of_parameters',
							// 'fieldtype': 'Table',
							// 'label': __('Parameters With Cost'),
							// 'options': 'Parameters',
							// "get_query": function () {
							// 	return {
							// 		filters: [
							// 			["Parameters", "parameter_group", "=", parameter_group]
							// 		]
							// 	};
							// }
						},



					],
				});
				d.set_primary_action(__('Update'), function() {
					d.hide();
				// 	var args = d.get_values();
				// 	frappe.call({
				// 		args: {
				// 			"name": frm.doc.name,
				// 			"voucher_type": frm.doc.voucher_type,
				// 			"company": args.company
				// 		},
				// 		method: "erpnext.accounts.doctype.journal_entry.journal_entry.make_inter_company_journal_entry",
				// 		callback: function (r) {
				// 			if (r.message) {
				// 				var doc = frappe.model.sync(r.message)[0];
				// 				frappe.set_route("Form", doc.doctype, doc.name);
				// 			}
				// 		}
				// 	});
				});
				d.show();
				}
			}

		},

	],
	 onload: function(report) {
		report.page.add_inner_button(__("Update the Cost"), function() {
			var me = frappe.query_report;
			me.title = me.report_name;
			var filters = {}
		});
		report.page.add_inner_button(__("Reset"), function() {
			var me = frappe.query_report;
			me.title = me.report_name;
			var filters = {}
		});
		report.page.add_inner_button(__("Reset All"), function() {
			var me = frappe.query_report;
			me.title = me.report_name;
			var filters = {}
		});

		report.page.add_inner_button(__("Save the Cost Temporarilly"), function() {
			var me = frappe.query_report;
			me.title = me.report_name;
			var filters = {}
		});
		report.page.add_inner_button(__("Save the Cost Permanently"), function() {
			var me = frappe.query_report;
			me.title = me.report_name;
			var filters = {}
		});
	}
};
