cd c:\xampp\htdocs\lab_nodejs\src

mkdir core\config, core\middlewares, core\utils, core\models, core\routes -Force
mkdir modules\catalog\controllers, modules\catalog\models, modules\catalog\routes, modules\catalog\services -Force
mkdir modules\checkout\controllers, modules\checkout\models, modules\checkout\routes, modules\checkout\services -Force
mkdir modules\promotions\controllers, modules\promotions\models, modules\promotions\routes, modules\promotions\services -Force
mkdir modules\users\controllers, modules\users\models, modules\users\routes, modules\users\services -Force
mkdir modules\inventory\controllers, modules\inventory\models, modules\inventory\routes, modules\inventory\services -Force
mkdir modules\content\controllers, modules\content\models, modules\content\routes, modules\content\services -Force
mkdir modules\seed\controllers, modules\seed\routes, modules\seed\services -Force

Move-Item config\* core\config\
Move-Item middlewares\* core\middlewares\
Move-Item utils\* core\utils\

Move-Item controllers\product.controller.js modules\catalog\controllers\
Move-Item controllers\category.controller.js modules\catalog\controllers\
Move-Item models\Product.model.js modules\catalog\models\
Move-Item models\Category.model.js modules\catalog\models\
Move-Item routes\products.js modules\catalog\routes\
Move-Item routes\categories.js modules\catalog\routes\
Move-Item services\catalog.service.js modules\catalog\services\
Move-Item services\category.service.js modules\catalog\services\

Move-Item controllers\orders.controller.js modules\checkout\controllers\
Move-Item models\Order.model.js modules\checkout\models\
Move-Item models\Payment.model.js modules\checkout\models\
Move-Item routes\orders.js modules\checkout\routes\
Move-Item routes\cart.js modules\checkout\routes\
Move-Item services\orders.service.js modules\checkout\services\
Move-Item services\checkout.service.js modules\checkout\services\
Move-Item services\cart.service.js modules\checkout\services\

Move-Item models\Voucher.model.js modules\promotions\models\

Move-Item controllers\user.controller.js modules\users\controllers\
Move-Item controllers\customers.controller.js modules\users\controllers\
Move-Item models\User.model.js modules\users\models\
Move-Item models\Customer.model.js modules\users\models\
Move-Item routes\user.js modules\users\routes\
Move-Item routes\customers.js modules\users\routes\
Move-Item services\users.service.js modules\users\services\
Move-Item services\customers.service.js modules\users\services\

Move-Item controllers\purchaseOrders.controller.js modules\inventory\controllers\
Move-Item models\Inventory.model.js modules\inventory\models\
Move-Item models\PurchaseOrder.model.js modules\inventory\models\
Move-Item models\Supplier.model.js modules\inventory\models\
Move-Item routes\purchaseOrders.js modules\inventory\routes\
Move-Item services\purchaseOrders.service.js modules\inventory\services\

Move-Item controllers\post.controller.js modules\content\controllers\
Move-Item models\Article.model.js modules\content\models\
Move-Item routes\post.js modules\content\routes\
Move-Item services\posts.service.js modules\content\services\

Move-Item controllers\seeder.controller.js modules\seed\controllers\
Move-Item routes\seeder.js modules\seed\routes\
Move-Item services\seeder.service.js modules\seed\services\

Move-Item models\Counter.model.js core\models\
Move-Item routes\index.js core\routes\
Move-Item routes\shop-quan-ao.code-workspace .\

Remove-Item config, middlewares, utils, controllers, models, routes, services -Recurse -Force
