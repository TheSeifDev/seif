# تخزين ملفات لوحة الإدارة

الموقع الحالي يعمل على Vercel، والبنية السابقة اختارت Neon وBetter Auth/GitHub. التخزين المنفذ لملفات Dashboard هو private Vercel Blob: الملفات لا تُقدّم عبر عنوان Blob الخام، بل عبر `/api/media/<id>` بعد فحص المراجع المنشورة أو جلسة المالك. التوثيق الرسمي يدعم `access: private` في SDK من الإصدار 2.3 وما بعده، وقراءة stream عبر `get`، وكتابة عبر `put` وحذف عبر `del`.[1]

عند ربط مخزن خاص بالمشروع، يمكن استعمال OIDC وBLOB_STORE_ID على Vercel أو رمز BLOB_READ_WRITE_TOKEN محفوظ كمتغير خادم. لا توجد مفاتيح داخل المحتوى العام. وصول Neon وVercel المقترح في هذه المهمة لم يُقبل، لذا لم يتم توفير مخزن أو اعتماد نشر فعلي ولم تُنفذ عمليات ملفات على حساب المستخدم. تطبيق الـAPI يرفض العمليات عند غياب الإعدادات، ويتحقق من PNG/JPEG/WebP/PDF وحد 4MB ويرفض SVG والملفات التنفيذية.

## References

[1]: https://vercel.com/docs/vercel-blob/private-storage "Vercel private storage and authenticated SDK access"
