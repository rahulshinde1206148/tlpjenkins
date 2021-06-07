var item_name = '';
frappe.ui.form.on("Quotation", {
	onload: function(frm) {
		if(frm.doc.__islocal ==1) {
			cur_frm.clear_table("items");
			cur_frm.refresh_fields();
		}
	},
	validate: function (frm) {
		if(frm.doc.items){
			frm.doc.items.forEach(function(row){
			if(row.rate){
				frappe.model.set_value(row.doctype, row.name, 'margin_value', ((row.rate-row.rate_value)/row.rate_value)*100)
			}
			});
			}
	},
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
		var options = [];
		frm.fields_dict["items"].grid.add_custom_button(__('Add Assembly'),() =>{
		var d = new frappe.ui.Dialog({
			'fields': [
				{'fieldname': 'select_item',
				 'fieldtype': 'Link',
				 "options":  "Cost Sheet", 
				 "label": __("Select Item"),
				 "get_query": function () {
				    },
				}
				],
			});
		   d.set_primary_action(__('Get Data'), function() {
		   	var data = d.get_values();
		   	this.data = [];
		   	frappe.call({
				method: "frappe.client.get",
				args:{
					doctype: "Cost Sheet",
					filters: {'name': data.select_item}
				},
				callback:function(r) {
					if(r){
						item_name = r.message.description
					}
				}
			});
			// inner_dialog.refresh();
			const inner_dialog = new frappe.ui.Dialog({

             	fields: [
				   {
						"fieldname":"selected_item",
						"fieldtype": "Link",
						"options": "Cost Sheet",
						"default" :data.select_item ,
						"read_only":1,
				    },
				    {
						fieldname: "cost_sheet_items", fieldtype: "Table",
						cannot_add_rows: 1,
						data: this.data,						
						get_data: () => {
							return this.data;
						},
						fields: [
							{
								fieldtype:'Link',
								fieldname:"ri_no",
								options: 'Item',
								in_list_view: 1,
								label: __('RI No'),
								columns:1,
								size: 2,
								"read_only":1,
							
							},
							{
								fieldtype:'Text',
								fieldname:"description",
								in_list_view: 1,
								label: __('Description'),
								columns : 1,
								width: 40,
								"read_only":1,
							},
							{
								fieldtype:'Link',
								fieldname:"material_type",
								options: 'Made Out Of',
								in_list_view: 1,
								label: __('Material Type'),
								columns : 1,
								width: 40,
								"read_only":1,
							},
							
							{
								fieldtype:'Int',
								fieldname:"qty",
								in_list_view: 1,
								label: __('Quantity'),
								columns : 1,
								width: 40,
								"read_only":1,
							},

							{
								fieldtype:'Currency',
								fieldname:"set_rate",
								in_list_view: 1,
								label: __('Set Rate'),
								columns : 1,
								width: 40,
								"read_only":1,
							},
							{
								fieldtype:'Currency',
								fieldname:"basic_rate",
								in_list_view: 0,
								label: __('Basic Rate'),
								columns : 1,
								width: 40,
								"read_only":1,
							},
							{
								fieldtype:'Currency',
								fieldname:"cost_rate",
								in_list_view: 0,
								label: __('Cost Rate'),
								columns : 1,
								width: 40,
								"read_only":1,
							},
							{
								fieldtype:'Currency',
								fieldname:"price1",
								label: __('Price for Margin 1'),
								"read_only":1,
								width: 40,
								in_list_view: 1,
								columns : 1
							},
							{
								fieldtype:'Percent',
								fieldname:"margin_percent1",
								label: __('Margin 1 (%)'),
								"read_only":1,
								width: 40,
								in_list_view: 1,
								innerWidth: 20,
							},
							{
								fieldtype:'Button',
								fieldname:"hash",
								in_list_view: 1,
								label: __('#'),
								width: 40,
								columns : 1,
								click: function(){
								    var args = inner_dialog.get_values();
								    var cost_shit_data = args.cost_sheet_items;
								    cost_shit_data.forEach(d => {
								    })

									var hash_dialog = new frappe.ui.Dialog({
								    	title: __(""),
								    	fields: [
								    		{
								    			"fieldtype": "HTML",
								    			"label": __(""),
								    			"fieldname": "hash_button_dialog"
								    		}
								    	]
								    });
								    frappe.call({
										method: 'tlp_app.tlp_app.custom_scripts.quotation.quotation.get_competitor_data',
										async: false,
										args: {"data":data},
										callback: function(r) {
											if(r.message){
												var item_name = r.message.item_name
												hash_dialog.get_field("hash_button_dialog").$wrapper.append(get_timer_html());
												function get_timer_html() {
													var for_data = ''
													var index = 0
													$.each(r.message.data, function(i, row){
														index = index + 1
														for_data = for_data + `<tr>
															<td style="text-align: center;">${__(index)}</td>
															<td style="text-align: left;">${__(row.competitor_name)}</td>
															<td style="text-align: right;">${__(row.order_number)}</td>
															<td style="text-align: right;">${__(row.order_date)}</td>
															<td style="text-align: right;">${__(row.ordered_quantity)}</td>
															<td style="text-align: right;">${__(row.rate)}</td>
														</tr>`
													 });	
													var table_data = `
														<table class="table table-bordered">
															<tr>
																<th style="text-align: left;" colspan="6">${__(data.selected_item)}-${__(item_name)}</th>
															</tr>
															<tr style="background-color: #f7fafc;">
																<th style="text-align: center;">Sr. No.</th>
																<th style="text-align: center;">Competitor Name</th>
																<th style="text-align: center;">PO No.</th>
																<th style="text-align: center;">PO Date</th>
																<th style="text-align: center;">Qty. Sold</th>
																<th style="text-align: center;">Rate</th>
															</tr>`+	for_data +
														`</table>
													`;
													return table_data
												}
											}
										}
									});
								    hash_dialog.show();
								    hash_dialog.refresh();						
				              	}	
							},
							{
								fieldtype:'Button',
								fieldname:"aero",
								in_list_view: 1,
								label: __('->'),
								width: 40,
								columns : 1,
								click: function(){
									var data = inner_dialog.get_values();
									var hash_dialog = new frappe.ui.Dialog({
								    	title: __(""),
								    	fields: [
								    		{
								    			"fieldtype": "HTML",
								    			"label": __(""),
								    			"fieldname": "aero_button_dialog"
								    		}
								    	]
								    });
				              		frappe.call({
										method: 'tlp_app.tlp_app.custom_scripts.quotation.quotation.get_material_data',
										freeze: true,
										args: {"data":data},
										callback: function(r) {
											if(r.message){
												hash_dialog.get_field("aero_button_dialog").$wrapper.append(get_timer_html());
												function get_timer_html() {
													var item_name = r.message.item_name
													var for_data = ''
													$.each(r.message.data, function(i, row){
														for_data = for_data + `<tr>
															<td style="text-align: right;">${__(row.drilling)}</td>
															<td style="text-align: right;">${__(row.bending)}</td>
															<td style="text-align: right;">${__(row.Machining)}</td>
															<td style="text-align: right;">${__(row.Welding)}</td>
															<td style="text-align: right;">${__(row.forging)}</td>
															<td style="text-align: right;">${__(row.file)}</td>
															<td style="text-align: right;">${__(row.die)}</td>
															<td style="text-align: right;">${__(row.miscellaneous)}</td>
														</tr>`
													 });	
													var table_data = `
														<table class="table table-bordered">
															<tr>
																<th style="text-align: left;" colspan="8">${__(data.selected_item)}-${__(item_name)}</th>
															</tr>
															<tr style="background-color: #f7fafc;">
																<th style="text-align: center;">Drilling</th>
																<th style="text-align: center;">Bending</th>
																<th style="text-align: center;">Machining</th>
																<th style="text-align: center;">Welding</th>
																<th style="text-align: center;">Forging</th>
																<th style="text-align: center;">Filing</th>
																<th style="text-align: center;">Die</th>
																<th style="text-align: center;">Miscellaneous</th>
															</tr>`+	for_data +
														`</table>
													`;
													return table_data
												}										
											}
										}
									});
									hash_dialog.show();	
									hash_dialog.refresh();								
				              	}	
							},	
							{fieldtype:"Column Break"},
							{
								fieldtype:'Percent',
								fieldname:"margin_percent2",
								label: __('Margin 2(%)'),
								"read_only":1,
								in_list_view: 0,
                                columns : 1
							},
							{
								fieldtype:'Currency',
								fieldname:"price2",
								in_list_view: 0,
								label: __('Price for Margin 2'),
								"read_only":1,
								columns : 1
							},
							{
								fieldtype:'Percent',
								fieldname:"margin_percent3",
								label: __('Margin 3(%)'),
								"read_only":1,
								in_list_view: 0,
								columns : 1
							},
							{
								fieldtype:'Currency',
								fieldname:"price3",
								in_list_view: 0,
								label: __('Price for Margin 3'),
								"read_only":1,
								columns : 1
							},
							{
								fieldtype:'Percent',
								fieldname:"comp_rt_min",
								in_list_view: 1,
								label: __('Comp. Rt.(Min)'),
								"read_only":1,
								columns : 1
							},
							{
								fieldtype:'Currency',
								fieldname:"comp_rt_max",
								in_list_view: 1,
								label: __('Comp. Rt.(Max)'),
								columns : 1,
								"read_only":1,
							},
							{
								fieldtype:'Check',
								fieldname:"is_fasteners",
								label: __('Is Fasteners'),
								"read_only":1,
							},
						],
					},
				]
            });
            var data = inner_dialog.get_values();
			frappe.call({
				method: "tlp_app.tlp_app.custom_scripts.quotation.quotation.get_cost_sheet_and_comp_data",
				// freeze: true,
				args: {
					cost_sheet_item: data.selected_item
				},
				callback: function(r) {
					if (r.message){ 
						const cost_sheet_data = r.message
						cost_sheet_data.forEach(d => {
		        			inner_dialog.fields_dict.cost_sheet_items.df.data.push({
								"ri_no": d.ri_no,
								"description": d.description,
								"material_type": d.material_type,
								"qty": d.quantity,
								"set_rate": d.set_rate,
								"basic_rate": d.basic_rate,
								"cost_rate": d.cost_rate,
								"margin_percent1": d.percent_1,
								"margin_percent2": d.percent_2,
								"margin_percent3": d.percent_3,
								"price1": d.amount_of_percent_1,
								"price2": d.amount_of_percent_2,
								"price3": d.amount_of_percent_3,
								"comp_rt_min": d.comp_min_rate,
								"comp_rt_max": d.comp_max_rate,
                                "is_fasteners": d.is_fasteners,
								"hash":"#",
								"aero":"->",
							});
						})
						this.data = inner_dialog.fields_dict.cost_sheet_items.df.data;
						inner_dialog.fields_dict.cost_sheet_items.grid.refresh();
	        		}
				}
			});
			inner_dialog.set_primary_action(__('Get Items'), function() {
					var dialog_data = inner_dialog.get_values()
					// if(dialog_data.wo_fastener == 1){
						dialog_data.cost_sheet_items.forEach(d => {
							// if(d.is_fasteners == 1){
								var childTable = cur_frm.add_child("items");
								childTable.item_code = d.ri_no
								frappe.call({
									"method": "frappe.client.get",
									"args": {
										"doctype": "Item",
										"name": d.ri_no
									},
									"callback": function(response) {
										var item_doc = response.message;

										if (item_doc) {
											childTable.item_name = item_doc.item_name
											childTable.uom = item_doc.stock_uom
										}
									}
								});
								childTable.description = d.description
								childTable.qty = d.qty
								childTable.rate = d.cost_rate
								childTable.rate_value = d.cost_rate
								childTable.is_fasteners = d.is_fasteners
								cur_frm.refresh_fields("items");
							// }
						})	
					
					inner_dialog.hide();
                 d.hide();

				});
			inner_dialog.show();	
            inner_dialog.$wrapper.find('.modal-dialog').css("width", "1000px");
			});
			 d.show();
			 d.refresh();
	    }
	    )
	}
});
