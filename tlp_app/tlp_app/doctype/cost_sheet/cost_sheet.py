# -*- coding: utf-8 -*-
# Copyright (c) 2021, Indictrans and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _, throw
from frappe.model.document import Document
import collections, functools, operator 
from frappe.utils import flt

class CostSheet(Document):
    def validate(self):
       pass
      
    def before_save(self):
        set_labour_cost(self)
        get_value_of_fastneres_from_purchase_invoice(self)
        set_basic_rate_cost_rate(self) 
        calculate_amount_of_percentge(self)
        
def get_value_of_fastneres_from_purchase_invoice(doc):
    if doc.cost_working_items:
        for i in doc.cost_working_items:
            if i.is_fasteners == 1:
                fasteners_data = frappe.db.sql("""SELECT qty, item_cost from `tabPurchase Invoice Item` 
                    where docstatus=1 and item_code='{0}' """.format(i.ri_no), as_dict=1)
                if fasteners_data:
                    result = dict(functools.reduce(operator.add, map(collections.Counter, fasteners_data)))
                    i.piece_rate = result.get('item_cost') / result.get('qty')
                else:
                    throw(_("Please create purchase invoice for fasteners items "))
            else:
                if i.labour_cost or i.material_cost:                  
                    i.piece_rate = i.labour_cost + i.material_cost
            if i.piece_rate:
                i.set_rate =i.piece_rate *i.quantity

def set_basic_rate_cost_rate(doc):
    if doc.cost_working_items:
        total_basic, total_cost, total_fasteners = 0.0, 0.0, 0.0;
        for i in doc.cost_working_items:
            if i.set_rate:
                if i.is_fasteners == 0:
                    i.basic_rate = i.set_rate
                else:
                    bom_doc = frappe.get_doc("BOM", doc.assembly)
                    total_fasteners += i.set_rate
                    if len(bom_doc.items) == i.idx:
                        i.basic_rate = total_fasteners
                        bom_doc.save()
            if i.basic_rate:
                total_basic += flt(i.basic_rate)
                tlp_setting_doc = frappe.get_doc("TLP Setting Page","TLP-Setting-00001")
                if tlp_setting_doc.cost_on_overheads :
                    i.percent_on_basic_rate_for_cost_rate = tlp_setting_doc.cost_on_overheads
                if i.percent_on_basic_rate_for_cost_rate > 0 :
                    i.cost_rate = ( flt(i.basic_rate)  * i.percent_on_basic_rate_for_cost_rate) 
                    total_cost += flt(i.cost_rate)
    if doc.costsheet_items :
        for i in doc.costsheet_items:
            i.basic_rate = total_basic
            i.cost_rate = total_cost
            i.total_weight = get_total_weight(doc)
            if flt(i.percent_1) > 0:
                i.amount_of_percent_1 = ((i.cost_rate * flt(i.percent_1))/100)+i.cost_rate
            else:
                throw(_("Please add value of <b>Percent 1</b> for the item {0}". format(i.ri_no )))
            if flt(i.percent_2)  > 0:
                i.amount_of_percent_2 = ((i.cost_rate * flt(i.percent_2))/100)+i.cost_rate
            else:
                throw(_("Please add value of <b>Percent 2</b> for the item {0}". format(i.ri_no )))
            if flt(i.percent_3) > 0:
                i.amount_of_percent_3 = ((i.cost_rate * flt(i.percent_3))/100)+i.cost_rate
            else:
                throw(_("Please add value of <b>Percent 3</b> for the item {0}". format(i.ri_no )))

def calculate_amount_of_percentge(doc):
    for i in doc.cost_working_items:
        if i.cost_rate:
            if flt(i.percent_1) > 0:
                i.amount_of_percent_1 = ((i.cost_rate * flt(i.percent_1))/100)+i.cost_rate
            else:
                throw(_("Please add value of <b>Percent 1</b> for the item {0}". format(i.ri_no)))
            if flt(i.percent_2)  > 0:
                i.amount_of_percent_2 = ((i.cost_rate * flt(i.percent_2))/100)+i.cost_rate
            else:
                throw(_("Please add value of <b>Percent 2</b> for the item {0}". format(i.ri_no )))
            if flt(i.percent_3) > 0:
                i.amount_of_percent_3 = ((i.cost_rate * flt(i.percent_3))/100)+i.cost_rate
            else:
                throw(_("Please add value of <b>Percent 3</b> for the item {0}". format(i.ri_no )))

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
        tlp_setting_doc = frappe.get_doc("TLP Setting Page","TLP-Setting-00001")
        if tlp_setting_doc.cost_on_overheads :
            labour_factor= frappe.db.get_value("TLP Setting Page", {'name':"TLP-Setting-00001"}, 'cost_on_labour_factor')
        i.labour_cost = sum_of_operations * labour_factor
        for j in doc.cost_working_items:
            if j.ri_no == i.ri_no:
                j.labour_cost = i.labour_cost