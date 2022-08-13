<!-- Models -->

- user
  -- name
  -- email
  -- password

- collection
  -- title
  -- items

- items
  -- title
  -- url
  -- image? - as in image Url
  --- multer ???
  --- cloudinary ???
  --- multer-storage-cloudinary ???
  --- enctype="multipart/form-data"
  --- dotenv
  -- text / notes
  -- comments?
  -- status?? (possible Todo Function?)

<!-- Routes -->

/Home

/setttings/
/settings/edit/
/settings/update-password/
/settings/delete-user/

/collection/all
/collection/add
/collection/edit
/collection/delete
/collection/:id/

/item/add
/item/edit
/item/:id/
