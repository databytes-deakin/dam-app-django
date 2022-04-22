For developers
==============
Clone the repository.

.. code-block:: console

    git clone https://github.com/DAM-Project/dam-app-django
    cd dam-app-django/

Installation
------------

.. code-block:: console

    pip install -r requirements.txt

Files
-----

.. code-block:: console

    cd dam-app-django/dam_app

    ls

You will see three folders and one file.
----------------------------------------

.. code-block:: console

    manage.py - command line utility to let you interact with django project

    dam_app - python package, used across multiple applications.

    app - the actual app that we're going to develop

    hello_world - toy app to play with.

Customize the hello_world/ folder (aka hello_world 
application) and get comfortable with Django framework.
=======================================================

.. _installation:

Installation
------------

To use DAM App, :

.. code-block:: console

   (.venv) $ pip install lumache

Creating recipes
----------------

To retrieve a list of random ingredients,
you can use the ``lumache.get_random_ingredients()`` function:

.. autofunction:: lumache.get_random_ingredients

The ``kind`` parameter should be either ``"meat"``, ``"fish"``,
or ``"veggies"``. Otherwise, :py:func:`lumache.get_random_ingredients`
will raise an exception.

.. autoexception:: lumache.InvalidKindError

For example:

>>> import lumache
>>> lumache.get_random_ingredients()
['shells', 'gorgonzola', 'parsley']
