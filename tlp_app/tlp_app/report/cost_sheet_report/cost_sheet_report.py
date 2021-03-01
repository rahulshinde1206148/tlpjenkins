# Copyright (c) 2013, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _


def execute(filters=None):
    # print("!!!!!!!!!!!!!!!!11 execute")
    columns = get_columns()
    data = get_data(filters)
    return columns, data

def get_data(filters):
    # print("*************** get_data", get_data)
    result ,row1 , final_result = [], {}, []

    cost_sheet_list = [i['name'] for i in frappe.get_list("Cost Sheet","name",{"docstatus":1})]
    print("_________________ cost_sheet_list",cost_sheet_list)
    for cost_sheet in cost_sheet_list:
        print("??????????? cost_sheet", cost_sheet)
        cost_sheet_item = frappe.db.sql("""SELECT ri_no, description, basic_rate, cost_rate 
            from `tabCostsheet Item` where parent='{0}'""".format(cost_sheet), as_dict=1) 
        row1 = cost_sheet_item[0]
        # print("<<<<<<<<<<<< row1", row1)
        result.append(row1)
        sub_assembly_items = frappe.db.sql(""" SELECT m.ri_no,m.finished_weightkg,m.rough_weightkg,
            o.drilling, o.bending, o.casting, o.maching, o.welding, o.forging, o.file, o.die,o.galvanization, 
            o.miscellaneous from `tabMaterial Cost Item` as m inner join `tabOperation or Labour Items` as o ON m.ri_no = o.ri_no 
             where o.parent='{0}' and m.parent='{0}'""".format(cost_sheet,cost_sheet), as_dict=1)
        # print("############# sub_assembly_items", sub_assembly_items)
        
        cost_working_items = frappe.db.sql("""SELECT distinct(c.ri_no),c.description,c.material_type, c.quantity, c.material_cost, 
            c.labour_cost, c.piece_rate, c.set_rate, c.basic_rate, c.cost_rate,c.amount_of_percent_1, c.amount_of_percent_2, c.amount_of_percent_3
            from `tabCost Working Items` as c , `tabOperation or Labour Items` as O 
            where O.parent='{0}' and c.parent='{0}' order by c.idx""".format(cost_sheet,cost_sheet), as_dict=1)
        for cost_working in cost_working_items:
            for sub_assembly in sub_assembly_items:
                if sub_assembly.get('ri_no')==cost_working.get('ri_no'):
                    sub_assembly.update(cost_working)
                    result.append(sub_assembly)
            else:
                if cost_working.get('labour_cost') == 0.0:
                    result.append(cost_working)
                    # print("$$$$$$$$$$$$$$ cost_working", cost_working)
        columns = [i['fieldname'] for i in get_columns()]
        print("$$$$$$$$$$$ columns", columns)    
        blank_row = { k:[] for k in columns }
        del blank_row['quantity']
        result.append(blank_row)
    print("@@@@############ result", result)

    
    # final_result.append(result)
    return result

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
           "width": 60
        },
        {
           "fieldname": "quantity",
           "fieldtype": "Int",
           "label": "Quantity",
           "width": 30
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
           "fieldname": "casting",
           "fieldtype": "Currency",
           "label": "Casting",
           "width": 60
        },
        {
           "fieldname": "galvanization",
           "fieldtype": "Currency",
           "label": "Galvanization",
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

@frappe.whitelist()
def get_parameter_data(parameter_group):
  # print("////parameter_group")
  parameter_list = [i['parameter'] for i in frappe.get_list("Parameters","parameter",{"parameter_group":parameter_group})]
  # print("########## parameter_list", parameter_list)
  parameter_data = []
  for parameter in parameter_list:
    tlp_setting_doc = frappe.get_doc("TLP Setting Page","TLP-Setting-00001")
    for p in tlp_setting_doc.aluminium_bronze:
      if parameter == p.parameter:
        parameter_dict = {'parameter':parameter, 'cost':p.rskg }
        parameter_data.append(parameter_dict)
    for p in tlp_setting_doc.aluminium:
      if parameter == p.parameter:
        parameter_dict = {'parameter':parameter, 'cost':p.rskg }
        parameter_data.append(parameter_dict)
    for p in tlp_setting_doc.ferrous:
      if parameter == p.parameter:
        parameter_dict = {'parameter':parameter, 'cost':p.rskg }
        parameter_data.append(parameter_dict)
  # print("^^^^^^^^^^^^^parameter_data ",parameter_data)
  return parameter_data


@frappe.whitelist() 
def get_updated_parameter_data(changed_arg, previous_arg, report_columns, report_data):
  # print("????????????????before json changed_arg",type(changed_arg), changed_arg, "previous_arg", type(previous_arg),previous_arg)
  import json
  changed_arg = json.loads(changed_arg)
  previous_cost_list = json.loads(previous_arg)
  parameter_group = changed_arg.get('parameter_for_updating_cost')
  changed_cost_list = changed_arg.get('cost_of_parameters')
  print("????????????????list ", type(changed_cost_list),changed_cost_list, "previous_cost_list",type(previous_cost_list), previous_arg)
  previous_cost_data, changed_cost_data = [], []
  for previous in previous_cost_list:
    for changed in changed_cost_list:
      if previous.get('parameter') == changed.get('parameter') and previous.get('cost') != changed.get('cost'):
        previous_cost = { previous.get('parameter'): previous }
        changed_cost = { changed.get('parameter'):changed } 
        previous_cost_data.append(previous)
        changed_cost_data.append(changed)
  print("############ previous", previous_cost_data)
  
  print("############ changed",changed_cost_data)
  # for data in report_data:
  report_data = json.loads(report_data)
  # print("/////report_data", report_data, type(report_data))
  cost_sheet_item_list = []
  cost_sheet_item = []
  for data in report_data:
    if data.get('ri_no')== []:
      cost_sheet_item_list.append(cost_sheet_item)
      cost_sheet_item = []
    else:
      cost_sheet_item.append(data)
      # print("########## data", data)
  cost_sheet_dict_of_list = []
  for cost_sheet_item in cost_sheet_item_list:
    # print("!!!!!!!!!!! cost_sheet_item", cost_sheet_item)
    cost_sheet_item_dict, operation_item_list, fasteners_list = {}, [], []
    for item in cost_sheet_item:
      if 'quantity' not in item.keys():
        # print("############### if item", item)
        cost_sheet_item_dict['cost_sheet_item'] = item
      elif 'galvanization' in item.keys():
        # print("@@@@@@@@@@@@@@@ elif item", item)
        operation_item_list.append(item)
        # operation_item =
      else:
        # print("!!!!!!!!!!!!!!!!else item", item)
        fasteners_list.append(item)
    # print("222222222222222 operation_item_list", operation_item_list)
    cost_sheet_item_dict['operation_item'] = operation_item_list
    cost_sheet_item_dict['fasteners'] = fasteners_list
    get_opeartions_cost(cost_sheet_item_dict['operation_item'], changed_cost_data) 
    cost_sheet_dict_of_list.append(cost_sheet_item_dict)

    
    
  print("333333333333333 cost_sheet_dict_of_list",cost_sheet_dict_of_list )

def get_opeartions_cost(operation_items, changed_cost_data):
  for oper_item in operation_items:
    for changed_cost in changed_cost_data:
      print("//////////// changed_cost", changed_cost)
    
      print("??????????? oper_item", oper_item)
      item_data = frappe.db.sql(""" SELECT galvanization_parameter, finished_weight, weight_per_unit, casting_parameter 
                                    FROM `tabItem` WHERE name='{0}'""".format(oper_item.get('ri_no')), as_dict=1)
      print("??????????? item_data", item_data)
      if oper_item.get('galvanization'):
        if item_data[0].get('galvanization_parameter') == changed_cost.get('parameter'):
          oper_item['galvanization'] = changed_cost.get('cost') * item_data[0].get('finished_weight')
          print("//////////////oper_item['galvanization'] ", oper_item['galvanization'])
      if oper_item.get('casting'):
        if item_data[0].get('casting_parameter') == changed_cost.get('parameter'):
          oper_item['casting'] = changed_cost.get('cost') * item_data[0].get('finished_weight')
          print("//////////////oper_item['casting'] ", oper_item['casting'])



