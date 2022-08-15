<!-- ############# problems ############# -->

- relationship > do I really need to pass the owner Id to prevent other users from accessing items
- how do you use the res.locals variable when creating your own middleware

<!-- ############# Models ############# -->

- user
  xx name
  xx email
  xx password
  xx collections

- collection
  xx title
  xx items
  xx isTodoList
  // maybe image, but not necessary

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

<!-- ############# Routes ############# -->

<!-- /Home -->

/setttings/
/settings/edit/
/settings/update-password/
/settings/delete-user/

<!-- /collection/all -->
<!-- /collection/:id/ -->
<!-- /collection/add -->
<!-- /collection/edit -->
<!-- /collection/delete -->

/collection/delete/ built more secure version with form and safety measurements.

/item/add
/item/:id/
/item/edit
/item/delete

<!-- ############# Extras ############# -->

- darkmode & keeping darkmode between sessions, maybe even storing it in the database or just binding it to preffered colorscheme...
