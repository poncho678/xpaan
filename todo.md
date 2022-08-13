<!-- Models -->

- user
  -- name
  -- email
  -- password

- collection
  xx title
  xx items
  -- isTodoList

- items
  xx title
  -- url
  xx image? - as in image Url
  --- multer ???
  --- cloudinary ???
  --- multer-storage-cloudinary ???
  --- enctype="multipart/form-data"
  --- dotenv
  xx text
  xx comments / notes
  xx status?? (possible Todo Function?)

<!-- Routes -->

/Home

/setttings/
/settings/edit/
/settings/update-password/
/settings/delete-user/

/collection/all
/collection/:id/
/collection/add
/collection/edit
/collection/delete

/item/add
/item/:id/
/item/edit
/item/delete
