body: JSON.stringify({
    items: selecteditems,
    invoiceinfo: {
        invoice_no: invoiceNo,
        invoice_date: invoiceDate,
        invoice_due_date: invoiceDueDate,
        status: "Invoice Generated"
    },
    srfId: srf.srf_id,
    file: files[0]
})