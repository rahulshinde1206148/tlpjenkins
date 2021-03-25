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
	 where parent=(select name from `tabCost Sheet` where item_name='{0}')
	 order by idx""".format(cost_sheet_item), as_dict=1)
	for item in cost_sheet_data:
		comp_min_rate = frappe.db.sql("""SELECT min(rate) from `tabCompetitor Rate` 
		where item_code='{0}'""".format(item.get('ri_no')), as_dict=1)
		if comp_min_rate[0]['min(rate)'] :
			item['comp_min_rate'] = comp_min_rate[0]['min(rate)']
		comp_max_rate = frappe.db.sql("""SELECT max(rate) from `tabCompetitor Rate` 
		where item_code='{0}'""".format(item.get('ri_no')), as_dict=1)
		if comp_max_rate[0]['max(rate)'] :
			item['comp_max_rate']: comp_max_rate[0]['max(rate)']
	return cost_sheet_data
		
@frappe.whitelist()
def get_competitor_data(data):
	print("################ data", data)
	
