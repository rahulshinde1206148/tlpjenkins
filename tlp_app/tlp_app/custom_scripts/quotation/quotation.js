var item_name = '';
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
		frm.fields_dict["items"].grid.add_custom_button(__('Add Assembly'), function() {
		var d = new frappe.ui.Dialog({
			'fields': [
				{'fieldname': 'select_item',
				 'fieldtype': 'Link',
				 "options":  "Item",
				 "label": __("Select Item"),
				 "get_query": function () {
					return {
						filters: [['Item', 'is_costsheet','=', 1]]
						}
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
					doctype: "Item",
					filters: {'name': data.select_item}
				},
				callback:function(r) {
					if(r){
						item_name = r.message.description
					}
				}
			});
			const inner_dialog = new frappe.ui.Dialog({

             	fields: [
				   {
						"fieldname":"selected_item",
						"fieldtype": "Link",
						"options": "Item",
						"default" :data.select_item + item_name ,
						"read_only":1,
				    },

					{fieldtype:"Section Break"},
					{
						fieldtype:'Check',
						fieldname:"with_fastener",
						in_place_edit: true,
						in_list_view: 1,
						label: __('With Fastener'),
						change: function() {
							var data = inner_dialog.get_values();
							if(data.with_fastener == 1){
                            	$('[data-fieldname="cost_sheet_items"]').find('input:checkbox').prop('checked', true);
							}
							else{
								$('.grid-row').find('input:checkbox').prop('checked', false);	
							}
						}
					},
					{fieldtype:"Column Break"},

					{
						fieldtype:'Check',
						fieldname:"wo_fastener",
						in_place_edit: true,
						in_list_view: 1,
						label: __('W/O Fastener'),
						change: function() {
							var data = inner_dialog.get_values();
							console.log("data: ", data.cost_sheet_items)
							if(data.wo_fastener == 1){
							var i;
							// console.log("len of costsheet list", data.cost_sheet_items.length)
							// console.log("value1 ###",data.cost_sheet_items[0].is_fasteners)
							for (i = 0; i < data.cost_sheet_items.length+1; i++) {
								if(data.cost_sheet_items[i].is_fasteners == 1){
									// console.log("data index@@@@@@",$('[data-idx='+data.cost_sheet_items[i].idx+']'))
									$('[data-idx='+data.cost_sheet_items[i].idx+']').find('input:checkbox').prop('checked', true);
								}
								}
							}
							else{
								$('[data-fieldname="cost_sheet_items"]').find('input:checkbox').prop('checked', false);	
							}
						}
					},
					
					{fieldtype:"Section Break"},
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
									// frappe.ui.Dialog({})
									var data = inner_dialog.get_values();
									// inner_dialog.show();
									console.log("DDDDDDDDDDDDD",inner_dialog.$wrapper.find('.modal-dialog').find('.col col-xs-1'))
									console.log("/////////data", data)
				              		frappe.call({
										method: 'tlp_app.tlp_app.custom_scripts.quotation.quotation.get_competitor_data',
										freeze: true,
										args: {"data":data},
										callback: function(r) {
											if(r.message){
												var d = new frappe.ui.Dialog({
													'fields': [
														{'fieldname': 'ht', 'fieldtype': 'HTML'},
														{'fieldname': 'today', 'fieldtype': 'Date', 'default': frappe.datetime.nowdate()}
													],
													primary_action: function(){
														d.hide();
														show_alert(d.get_values());
													}
												});
												d.fields_dict.ht.$wrapper.html("<table border = '1'><tr><th>Company</th><th>Contact</th><th>Country</th></tr>{% for row in r.message %}<tr><td>{{ row.item_code}}</td><td>{{ row.competitor_name}}</td><td>{{ row.rate}}</td></tr> {% endfor %}</table>");
												d.show();
												// dialog.hide();
												// window.location.reload()
											}
										}
									});
									
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
									// frappe.ui.Dialog({})
									var data = inner_dialog.get_values();
									// inner_dialog.show();
									/*console.log("DDDDDDDDDDDDD",inner_dialog.$wrapper.find('.modal-dialog').find('.col col-xs-1'))
									console.log("/////////data", data)*/
				              		frappe.call({
										method: 'tlp_app.tlp_app.custom_scripts.quotation.quotation.get_material_data',
										freeze: true,
										args: {"data":data},
										// args: {
										// 	data: data.selected_item
										// },
										callback: function(r) {
											if(r.message){
												console.log(r.message)
												var arow_data = r.message
												frappe.render_template("quotation",{"data":r.message})
												// $('.quotation').html($(frappe.render_template('quotation',{"arow_data":arow_data})))
												console.log("data_list.......", r.message[0])
												var d = new frappe.ui.Dialog({
													
													// 'fields': [
													// 			{
																// fieldname: "cost_sheet_items", fieldtype: "Table",
																// cannot_add_rows: 1,
																// data: this.data,						
																// get_data: () => {
																// 	return this.data;
																// },
																'fields': [
																	{
																		fieldtype:'Link',
																		fieldname:data["ri_no"],
																		options: 'Item',
																		in_list_view: 1,
																		label: __('RI No'),
																		columns:1,
																		"read_only":1,
																	
																	},
																	{
																		fieldtype:'Currency',
																		fieldname:"drilling",
																		in_list_view: 1,
																		label: __('Drilling'),
																		columns : 1,
																		"read_only":1,
																	},
																	]
													    /*{
															fieldname: "arow_data", fieldtype: "Table",
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
																	fieldtype:'Currency',
																	fieldname:"drilling",
																	in_list_view: 1,
																	label: __('Drilling'),
																	columns : 1,
																	width: 40,
																	"read_only":1,
																},
															],
														},*/
													}
													// ],

													/*primary_action: function(){
														d.hide();
														show_alert(d.get_values());
													}*/
												// }
												);
												d.show();

												// dialog.hide();
												// window.location.reload()
											}
										}
									});
									
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
					{fieldtype:"Section Break"},
                    {
						fieldtype:'Button',
						fieldname:"add_selected_assembly",
						label: __('Add Selected Assembly'),
						click: function(){
							// frappe.ui.Dialog({})
							var data = inner_dialog.get_values();
							// inner_dialog.show();
							console.log("DDDDDDDDDDDDD",inner_dialog.$wrapper.find('.modal-dialog').find('.col col-xs-1'))
							console.log("/////////data", data)
							  frappe.call({
								method: 'tlp_app.tlp_app.custom_scripts.quotation.quotation.get_set_qty',
								freeze: true,
								args: {"data":data},
								callback: function(r) {
									if(r.message){
										var d = new frappe.ui.Dialog({
											'fields': [
												{'fieldname': 'ht', 'fieldtype': 'HTML'},
												{
													fieldtype:'Int',
													fieldname:"qty",
													in_list_view: 1,
													label: __('Quantity'),
													columns : 1,
													width: 40,
												},
											],
											
											primary_action: function(){
												d.hide();
												show_alert(d.get_values());
											}
										});
										d.fields_dict.ht.$wrapper.html('Set Quantity');
										d.fields_dict.ht.$wrapper.find('form d [type="submit"]').attr('value', 'Set');
										d.show();
									}
								}
							});
							
						  }	
					}
				]
            });
			// inner_dialog.fields_dict.add_selected_assembly.$wrapper.html('<center><button type="button">Add Selected Assembly</button></center>')

            var data = inner_dialog.get_values();
			frappe.call({
				method: "tlp_app.tlp_app.custom_scripts.quotation.quotation.get_cost_sheet_and_comp_data",
				freeze: true,
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
					dialog_data = inner_dialog.get_values()
					// dialog.hide();
                 d.hide();

				});
			inner_dialog.show();	
            inner_dialog.$wrapper.find('.modal-dialog').css("width", "1000px");
			});
			// d.fields_dict.ht.$wrapper.html('Select Item');
			 d.show();
	    })
	}
});

