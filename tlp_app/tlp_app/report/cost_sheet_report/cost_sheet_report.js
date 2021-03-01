// Copyright (c) 2016, Indictrans and contributors
// For license information, please see license.txt
/* eslint-disable */
var parameter_group = ''
var changed_arg = {};
var previous_arg = {};
frappe.query_reports["Cost Sheet Report"] = {
	"filters": [
		{
			"fieldname":"select_parameter_for_updating_cost",
			"label": __("Select Parameter for Updating Cost"),
			"fieldtype": "Link",
			"options": "Parameter Group",
			"on_change": function(query_report) {
			    parameter_group = frappe.query_report.get_filter_value('select_parameter_for_updating_cost')
				if (parameter_group){
					this.data = [];
					const dialog = new frappe.ui.Dialog({
					title: __("Cost of Parameters "),
					fields: [
					   {
							"fieldname":"parameter_for_updating_cost",
							"label": __("Parameter for Updating Cost"),
							"fieldtype": "Link",
							"options": "Parameter Group",
							"default" : parameter_group,
							"read_only":1,
					    },
						{
							fieldname: "cost_of_parameters", fieldtype: "Table",
							cannot_add_rows: 1,
							data: this.data,
							get_data: () => {
								return this.data;
							},
							fields: [
							{
								fieldtype:'Link',
								fieldname:"parameter",
								options: 'Parameters',
								in_list_view: 1,
								label: __('Parameters'),
								change: function() {
										const parameter = this.grid_row.on_grid_fields_dict.parameters.get_value();
										frappe.db.get_value('Parameters', {'parameter_group': parameter_group}, 'name', (r) => {
											this.grid_row.on_grid_fields_dict.parameter.set_value(r.parameter);
										});
									}
								},
								{
									fieldtype:'Currency',
									fieldname:"cost",
									in_place_edit: true,
									in_list_view: 1,
									label: __('Cost'),
								}
							]
						},
					],
				});
				var data = dialog.get_values();
				frappe.call({
					method: "tlp_app.tlp_app.report.cost_sheet_report.cost_sheet_report.get_parameter_data",
					freeze: true,
					args: {
						parameter_group: parameter_group
					},
					callback: function(r) {
						if (r.message){ 
							const parameter_data = r.message
                            previous_arg = parameter_data
							parameter_data.forEach(d => {
			        			dialog.fields_dict.cost_of_parameters.df.data.push({
									"parameter": d.parameter,
									"cost": d.cost
								});
							})
							this.data = dialog.fields_dict.cost_of_parameters.df.data;
							dialog.fields_dict.cost_of_parameters.grid.refresh();
		        		}
					}
				});
				dialog.set_primary_action(__('Set'), function() {
					changed_arg = dialog.get_values()
					dialog.hide();


				});
				dialog.show();

				}
			}
		},
	],
	 onload: function(report) {
		report.page.add_inner_button(__("Update the Cost"), function() {
			var me = frappe.query_report;
			me.title = me.report_name;
			// report_data = me.get_values()
			console.log("@@@@@@@@@@@@@ report", report.columns)
			console.log("@@@@@@@@@@@@@ report", report.data)
			var filters = {}
			console.log("!!!!!!!!!!!changed_arg", changed_arg)
			frappe.query_report
			frappe.call({
				method: "tlp_app.tlp_app.report.cost_sheet_report.cost_sheet_report.get_updated_parameter_data",
				freeze: true,
				args: {
					'changed_arg': changed_arg,
					'previous_arg': previous_arg,
					'report_columns': report.columns,
					'report_data': report.data
				},
				callback: function(r) {
					if (r.message){ 
	        		}
				}
			});

			console.log("!!!!!!!!!!!previous_arg", previous_arg)


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
