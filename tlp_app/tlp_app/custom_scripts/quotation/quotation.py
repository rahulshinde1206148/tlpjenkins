from __future__ import unicode_literals
from frappe.model.document import Document
import frappe
from six import string_types


@frappe.whitelist()
def get_print_details(template_name):
	letter_detail = frappe.get_doc("Letter Detail Template", template_name)
	if letter_detail.response:
		return letter_detail.response

@frappe.whitelist()
def get_notes_details(template_name):
	note_detail = frappe.get_doc("Notes Template", template_name)
	if note_detail.notes and note_detail.disabled == 0:
		return note_detail.notes

@frappe.whitelist()		
def get_cost_sheet_and_comp_data(cost_sheet_item):
	cost_sheet_data = frappe.db.sql("""SELECT ri_no, description,material_type, quantity,set_rate, basic_rate,
	 cost_rate, percent_1, amount_of_percent_1, percent_2, amount_of_percent_2, percent_3, 
	 amount_of_percent_3,is_fasteners from `tabCost Working Items` 
	 where parent=(select name from `tabCost Sheet` where item_name='{0}' LIMIT 1)
	 order by idx""".format(cost_sheet_item), as_dict=1)
	for item in cost_sheet_data:
		comp_min_rate = frappe.db.sql("""SELECT min(rate) from `tabCompetitor Rate` 
		where item_code='{0}'""".format(item.get('ri_no')), as_dict=1)
		if comp_min_rate[0]['min(rate)'] :
			item['comp_min_rate'] = comp_min_rate[0]['min(rate)']
		comp_max_rate = frappe.db.sql("""SELECT max(rate) from `tabCompetitor Rate` 
		where item_code='{0}'""".format(item.get('ri_no')), as_dict=1)
		if comp_max_rate[0]['max(rate)'] :
			item['comp_max_rate']= comp_max_rate[0]['max(rate)']
	return cost_sheet_data
		
@frappe.whitelist()
def get_competitor_data(data):
	main_data = {}
	import json
	res = json.loads(data)
	# print("json",res['selected_item'])
	# print("type of json", type(res))
	material_ri_no = res['selected_item']
	data = frappe.db.sql("""SELECT item_code, item_name, competitor_name, 
	 order_number, order_date, ordered_quantity, rate, amount  from `tabCompetitor Rate` 
	 where item_code='{0}'""".format(material_ri_no), as_dict=1)

	item_name = frappe.db.sql("""SELECT item_name from `tabItem` where name='{0}'""".format(material_ri_no), as_list=1)
	main_data.update({"data":data})

	main_data.update({'item_name':item_name[0][0]})
	return main_data

@frappe.whitelist()
def get_material_data(data):
	main_data = {}
	import json
	res = json.loads(data)
	# print("json",res['selected_item'])
	# print("type of json", type(res))
	material_ri_no = res['selected_item']
	data = frappe.db.sql("""SELECT ri_no, drilling, bending, Machining, Welding, 
	 forging, file, die, miscellaneous from `tabOpearation Cost Setting` 
	 where ri_no='{0}'""".format(material_ri_no), as_dict=1)
	
	item_name = frappe.db.sql("""SELECT item_name from `tabItem` where name='{0}'""".format(material_ri_no), as_list=1)
	main_data.update({"data":data})

	main_data.update({'item_name':item_name[0][0]})
	return main_data
	
@frappe.whitelist()
def get_set_qty(data):
	import json
	# print("################ data shubhangi", data)
	# print("########## testing selected item", type(data))
	res = json.loads(data)
	# print("json",res['selected_item'])
	# print("type of json", type(res))
	return "data"
	