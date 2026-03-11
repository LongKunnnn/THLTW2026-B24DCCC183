export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        path: '/user/login',
        layout: false,
        name: 'login',
        component: './user/Login',
      },
      {
        path: '/user',
        redirect: '/user/login',
      },
    ],
  },

  ///////////////////////////////////
  // DEFAULT MENU
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: './TrangChu',
    icon: 'HomeOutlined',
  },
  {
    path: '/gioi-thieu',
    name: 'About',
    component: './TienIch/GioiThieu',
    hideInMenu: true,
  },
  {
    path: '/random-user',
    name: 'RandomUser',
    component: './RandomUser',
    icon: 'ArrowsAltOutlined',
  },


  {
    path: '/todo-list',
    name: 'TodoList',
    icon: 'OrderedListOutlined',
    routes: [
      {
        path: '/todo-list',
        redirect: '/todo-list/tasks',
      },
      {
        path: '/todo-list/tasks',
        name: 'Công việc',
        component: './TodoList',
      },
      {
        path: '/todo-list/product-manager',
        name: 'Quản lý Sản phẩm',
        component: './TodoList/product-manager',
      },
    ],
  },

  {
    path: '/quan-ly',
    name: 'Quản lý cửa hàng',
    icon: 'shop', 
    routes: [
      {
        path: '/quan-ly/products',
        name: 'Quản lý Sản phẩm',
        component: './products',
      },
      {
        path: '/quan-ly/orders',
        name: 'Quản lý Đơn hàng',
        component: './orders', 
      },
      {
        path: '/quan-ly/game',
        name: 'Trò chơi Đoán số',
        component: './game', 
      },
      {
        path: '/quan-ly/study-management',
        name: 'Quản lý Học tập',
        component: './studymanagement', 
      },
      {
        path: '/quan-ly/oantuti',
        name: 'Game Oẳn tù tì',
        component: './oantuti', 
      },
      {
        path: '/quan-ly/studymanagement2',
        name: 'Quản lý Học tập 2',
        component: './studymanagement2', 
      }
    ],
  },

  {
    path: '/notification',
    routes: [
      {
        path: './subscribe',
        exact: true,
        component: './ThongBao/Subscribe',
      },
      {
        path: './check',
        exact: true,
        component: './ThongBao/Check',
      },
      {
        path: './',
        exact: true,
        component: './ThongBao/NotifOneSignal',
      },
    ],
    layout: false,
    hideInMenu: true,
  },
  {
    path: '/',
    redirect: '/dashboard', 
  },
  {
    path: '/403',
    component: './exception/403/403Page',
    layout: false,
  },
  {
    path: '/hold-on',
    component: './exception/DangCapNhat',
    layout: false,
  },
  {
    component: './exception/404',
  },
];