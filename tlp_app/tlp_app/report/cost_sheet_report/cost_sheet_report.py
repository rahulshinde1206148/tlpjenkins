# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _


def execute(filters=None):
    print("!!!!!!!!!!!!!!!!11 execute")
    columns = get_columns()
    data = get_data(filters)
    return columns, data

def get_data(filters):
    print("*************** get_data", get_data)
    result ,row1, row2, row3, cost_working_list1, cost_working_list2 = [], {}, {},{}, [], []

    cost_sheet_list = [i['name'] for i in frappe.get_list("Cost Sheet","name",{"docstatus":1})]
    print("_________________ cost_sheet_list",cost_sheet_list)
    for cost_sheet in cost_sheet_list:
        print("??????????? cost_sheet", cost_sheet)
        cost_sheet_item = frappe.db.sql("""SELECT item_name, description, basic_rate, cost_rate 
            from `tabCostsheet Item` where parent='{0}'""".format(cost_sheet), as_dict=1) 
        row1 = cost_sheet_item[0]
        print("<<<<<<<<<<<< row1", row1)
        # result = {'row1':row1 }
        result.append(row1)
        sub_assembly_items = frappe.db.sql(""" SELECT m.ri_no,m.finished_weightkg,m.rough_weightkg,
            o.drilling, o.bending, o.casting, o.maching, o.welding, o.forging, o.file, o.die,o.galvanization, 
            o.miscellaneous from `tabMaterial Cost Item` as m inner join `tabOperation or Labour Items` as o ON m.ri_no = o.ri_no 
             where o.parent='{0}' and m.parent='{0}'""".format(cost_sheet,cost_sheet), as_dict=1)
        print("############# sub_assembly_items", sub_assembly_items)
        
        cost_working_items = frappe.db.sql("""SELECT distinct(c.ri_no),c.description,c.material_type, c.quantity, c.material_cost, 
            c.labour_cost, c.piece_rate, c.set_rate, c.basic_rate, c.cost_rate,c.amount_of_percent_1, c.amount_of_percent_2, c.amount_of_percent_3
            from `tabCost Working Items` as c , `tabOperation or Labour Items` as O 
            where O.parent='{0}' and c.parent='{0}' order by c.idx""".format(cost_sheet,cost_sheet), as_dict=1)
        print("$$$$$$$$$$$$$$$$ cost_working_items", cost_working_items)
        for cost_working in cost_working_items:
            for sub_assembly in sub_assembly_items:
                # row2.update(sub_assembly)
                if sub_assembly.get('ri_no')==cost_working.get('ri_no'):
                    sub_assembly.update(cost_working)
                    result.append(sub_assembly)
                    # cost_working_list1.append(sub_assembly)
                    # row2.update(cost_working)
                    print("############# sub_assembly",sub_assembly)
                    # result['row2'] = cost_working_list1
                    # result.append(cost_working_list1)
            else:
                print("@@@@@@@@@@@@ labour_cost", cost_working.get('labour_cost'))
                if cost_working.get('labour_cost') == 0.0:
                    result.append(cost_working)
                    # cost_working_list2.append(cost_working)
                    # row3.update(cost_working)
                    print("$$$$$$$$$$$$$$ cost_working", cost_working)
                    # result['row3'] = cost_working_list2
                    # result.append(cost_working_list2)
        
        # result.append(cost_working_list1)
        # result.append(cost_working_list2)

        
        
        print("^^^^^^^^^^^^^^^^^ result", result)

    return result
 
def get_result(filters):
    pass

def get_columns():
    return  [
        {
            "label": _("RI No."),
            "fieldname": "ri_no",
            "fieldtype": "Link",
            "options": "Item",
            "width": 60
        },
        {
            "label": _("Description"),
            "fieldname": "description",
            "fieldtype": "Text Editor",
            "width": 100
        },
        {
           "fieldname": "material_type",
           "fieldtype": "Link",
           "label": "Material Type",
           "options": "Made Out Of",
           "width": 30
        },
        {
           "fieldname": "quantity",
           "fieldtype": "Int",
           "label": "Quantity",
           "width": 20
        },
        {
           "fieldname": "rough_weightkg",
           "fieldtype": "Float",
           "label": "Rough Weight(KG)",
           "width": 60
        },
        {
           "fieldname": "finished_weightkg",
           "fieldtype": "Float",
           "label": "Finished Weight(KG)",
           "width": 60
        },
        {
           "fieldname": "material_cost",
           "fieldtype": "Currency",
           "label": "Material Cost",
           "width": 60
        },
        {
           "fieldname": "drilling",
           "fieldtype": "Currency",
           "label": "Drilling ",
           "width": 60
        },
        {
           "fieldname": "bending",
           "fieldtype": "Currency",
           "label": "Bending",
           "width": 60
        },
        {
           "fieldname": "maching",
           "fieldtype": "Currency",
           "label": "Machining",
           "width": 60
        },
        {
           "fieldname": "forging",
           "fieldtype": "Currency",
           "label": "Forging",
           "width": 60
        },
        {
           "fieldname": "file",
           "fieldtype": "Currency",
           "label": "File",
           "width": 60
        },
        {
           "fieldname": "die",
           "fieldtype": "Currency",
           "label": "Die",
           "width": 60
        },
        {
           "fieldname": "miscellaneous",
           "fieldtype": "Currency",
           "label": "Miscellaneous",
           "width": 60
        },
        {
           "fieldname": "welding",
           "fieldtype": "Currency",
           "label": "Welding",
           "width": 60
        },
        {
           "fieldname": "labour_cost",
           "fieldtype": "Currency",
           "label": "Labour Cost",
           "width": 60
        },
        {
           "fieldname": "piece_rate",
           "fieldtype": "Currency",
           "label": "Piece Rate",
           "width": 60
        },
        {
           "fieldname": "set_rate",
           "fieldtype": "Currency",
           "label": "Set Rate",
           "width": 60
        },
        {
           "fieldname": "basic_rate",
           "fieldtype": "Currency",
           "label": "Basic Rate",
           "width": 60
        },
        {
           "fieldname": "cost_rate",
           "fieldtype": "Currency",
           "label": "Cost Rate",
           "width": 60
        },
        {
           "fieldname": "praposed_cost",
           "fieldtype": "Currency",
           "label": "Praposed Cost",
           "width": 60
        },
        {
           "fieldname": "praposed_cost",
           "fieldtype": "Currency",
           "label": "Difference to the Original Cost",
           "width": 60
        },
        {
           "fieldname": "amount_of_percent_1",
           "fieldtype": "Percent",
           "label": "15%",
           "width": 60
        },
        {
           "fieldname": "amount_of_percent_2",
           "fieldtype": "Percent",
           "label": "25%",
           "width": 60
        },
        {
           "fieldname": "amount_of_percent_3",
           "fieldtype": "Percent",
           "label": "50%",
           "width": 60
        },
  
    ]