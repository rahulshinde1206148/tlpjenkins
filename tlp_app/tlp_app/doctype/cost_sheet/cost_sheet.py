# -*- coding: utf-8 -*-
# Copyright (c) 2021, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, throw
from frappe.model.document import Document

class CostSheet(Document):
    def validate(self):
        set_basic_rate_cost_rate(self) 
       
    def before_save(self):
        # delete_records()
        set_labour_cost(self)
    
def delete_records():
    frappe.db.sql("""delete from `tabMaterial Cost Item`""")

# def get_overhead_value()
#     tlp_setting_doc = frappe.get_doc("TLP Setting Page", "TLP-Setting-00001")
#     if tlp_setting_doc.cost_on_overheads :
#         return tlp_setting_doc.cost_on_overheads


def set_basic_rate_cost_rate(doc):
    if doc.cost_working_items:
        total_basic, total_cost, total_fasteners = 0.0, 0.0, 0.0;
        for i in doc.cost_working_items:
            if i.set_rate:
                if i.is_semifinished == 1 :
                    i.basic_rate = i.set_rate
                else:
                    bom_doc = frappe.get_doc("BOM", doc.assembly)
                    total_fasteners += i.set_rate
                    if bom_doc.items.length == doc.items.length :
                        i.basic_rate = total_fasteners
            if i.basic_rate:
                tlp_setting_doc = frappe.get_doc("TLP Setting Page", "TLP-Setting-00001")
                if tlp_setting_doc.cost_on_overheads :
                    i.percent_on_basic_rate_for_cost_rate = tlp_setting_doc.cost_on_overheads
                try:
                    if i.basic_rate != '':
                        flt_basic_rate= float(i.basic_rate)
                        if flt_basic_rate:
                            if i.percent_on_basic_rate_for_cost_rate > 0 :
                                i.cost_rate = ((flt_basic_rate * i.percent_on_basic_rate_for_cost_rate)/100)+flt_basic_rate
                            else:
                                throw(_("Please add value of <b>Percent On Basic Rate For Cost Rate</b> for the item {0}". format(i.ri_no
                                    )))

                except Exception as e:
                    pass
                total_basic += flt_basic_rate

            if i.cost_rate:
                try:
                    if i.cost_rate != '':
                        flt_cost_rate= float(i.cost_rate)
                        try:
                            if i.percent_1 > 0:
                                if i.percent_1 != '':
                                    flt_percent_1 = float(i.percent_1)
                            else:
                                throw(_("Please add value of <b>Percent 1</b> for the item {0}". format(i.ri_no
                                                )))
                            if i.percent_2  > 0:
                                if i.percent_2 != '':
                                    flt_percent_2 = float(i.percent_2)
                            else:
                                throw(_("Please add value of <b>Percent 2</b> for the item {0}". format(i.ri_no
                                                )))
                            if i.percent_3 > 0:
                                if i.percent_3 != '':
                                    flt_percent_3 = float(i.percent_3)
                            else:
                                throw(_("Please add value of <b>Percent 3</b> for the item {0}". format(i.ri_no
                                                )))
                        except Exception as e:
                            pass
                        i.amount_of_percent_1 = ((i.cost_rate * flt_percent_1)/100)+i.cost_rate if flt_percent_1 else 0.0
                        i.amount_of_percent_2 = ((i.cost_rate * flt_percent_2)/100)+i.cost_rate if flt_percent_2 else 0.0
                        i.amount_of_percent_3 = ((i.cost_rate * flt_percent_3)/100)+i.cost_rate if flt_percent_3 else 0.0
                except Exception as e:
                    pass
                total_cost += flt_cost_rate
    if doc.costsheet_items :
        for i in doc.costsheet_items:
            flt_percent_1, flt_percent_2, flt_percent_3 = 0.0, 0.0, 0.0
            i.basic_rate = total_basic
            i.cost_rate = total_cost
            i.total_weight = get_total_weight(doc)
            try:
                if i.percent_1 > 0:
                    if i.percent_1 != '':
                        flt_percent_1 = float(i.percent_1)
                else:
                    throw(_("Please add value of <b>Percent 1</b> for the item {0}". format(i.item_name
                                    )))
                if i.percent_2 > 0:
                    if i.percent_2 != '':
                        flt_percent_2 = float(i.percent_2)
                else:
                    throw(_("Please add value of <b>Percent 2</b> for the item {0}". format(i.item_name
                                    )))
                if i.percent_3 > 0:
                    if i.percent_3 != '':
                        flt_percent_3 = float(i.percent_3)
                else:
                    throw(_("Please add value of <b>Percent 3</b> for the item {0}". format(i.item_name
                                    )))
            except Exception as e:
                pass
            i.amount_of_percent_1 = ((i.cost_rate * flt_percent_1)/100)+i.cost_rate if flt_percent_1 else 0.0
            i.amount_of_percent_2 = ((i.cost_rate * flt_percent_2)/100)+i.cost_rate if flt_percent_2 else 0.0
            i.amount_of_percent_3 = ((i.cost_rate * flt_percent_3)/100)+i.cost_rate if flt_percent_3 else 0.0

def get_total_weight(doc):
    total_weight = 0.0
    if doc.assembly:
        bom = frappe.get_doc("BOM", doc.assembly)
        for i in bom.items:
            total_weight += (i.finished_weight * i.qty)
        return total_weight

def set_labour_cost(doc):
    for i in doc.operation_or_labour_items:
        sum_of_operations = 0.0
        if i.drilling :
            sum_of_operations += float(i.drilling) 
        if i.bending :
            sum_of_operations += float(i.bending) 
        if i.casting :
            sum_of_operations += float(i.casting) 
        if i.maching :
            sum_of_operations += float(i.maching) 
        if i.welding :
            sum_of_operations += float(i.welding) 
        if i.forging :
            sum_of_operations += float(i.forging) 
        if i.file :
            sum_of_operations += float(i.file) 
        if i.die :
            sum_of_operations += float(i.die) 
        if i.galvanization :
            sum_of_operations += float(i.galvanization) 
        if i.miscellaneous :
            sum_of_operations += float(i.miscellaneous) 
        labour_factor= frappe.db.get_value("Item", {'name':i.ri_no}, 'cost_on_labour_factor')
        i.labour_cost = sum_of_operations * labour_factor